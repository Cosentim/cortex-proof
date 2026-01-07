'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInput } from './chat-input';
import { ModelSelectorSimple } from './model-selector-simple';
import { ToolsPanel, type Tool } from './tools-panel';
import { TeachCortex } from '@/components/cortex';
import { Button } from '@/components/ui/button';
import { Brain, Trash2, Wrench, Loader2, ChevronDown, ChevronUp, ExternalLink, Globe } from 'lucide-react';

interface Source {
  url: string;
  title?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  sources?: Source[];
}

interface ChatInterfaceProps {
  showTeachPrompt?: boolean;
  onDismissTeachPrompt?: () => void;
  onTeach?: (prompt: string, category: string) => void;
  onConversationEnd?: () => void;
}

// Available tools
const AVAILABLE_TOOLS: Tool[] = [
  { id: 'web_search', name: 'Web Search', description: 'Search the internet for current information', icon: 'search', enabled: false },
  { id: 'code_interpreter', name: 'Code Interpreter', description: 'Run Python code and analyze data', icon: 'code', enabled: false },
  { id: 'file_analysis', name: 'File Analysis', description: 'Analyze uploaded documents and images', icon: 'file', enabled: false },
  { id: 'memory_search', name: 'Memory Search', description: 'Search through your saved memories', icon: 'brain', enabled: true },
];

export function ChatInterface({ showTeachPrompt, onDismissTeachPrompt, onConversationEnd }: ChatInterfaceProps) {
  const [modelId, setModelId] = useState<string>('gpt-4o-mini');
  const [deepResearch, setDeepResearch] = useState(false);
  const [tools, setTools] = useState<Tool[]>(AVAILABLE_TOOLS);
  const [showTools, setShowTools] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enabledTools = tools.filter(t => t.enabled);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for teach events from Cortex
  useEffect(() => {
    const handleTeachEvent = (e: CustomEvent<{ prompt: string; category: string }>) => {
      setInput(e.detail.prompt);
    };
    window.addEventListener('cortex-teach', handleTeachEvent as EventListener);
    return () => window.removeEventListener('cortex-teach', handleTeachEvent as EventListener);
  }, []);

  const handleTeachClick = (prompt: string, _category: string) => {
    setInput(prompt);
    onDismissTeachPrompt?.();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleTool = (toolId: string) => {
    setTools(prev => prev.map(t => 
      t.id === toolId ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          modelId,
          deepResearch,
          tools: enabledTools.map(t => t.id),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        reasoning: '',
        sources: [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let content = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          content += decoder.decode(value, { stream: true });
          
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id 
                ? { ...m, content } 
                : m
            )
          );
        }
      }

      // Auto-extract memories from user message in background
      extractMemoriesInBackground(userMessage.content);
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Background memory extraction (non-blocking)
  const extractMemoriesInBackground = async (content: string) => {
    try {
      await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      // Refresh cortex stats after extraction
      onConversationEnd?.();
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.debug('Background memory extraction failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleClearChat = () => {
    setMessages([]);
    onConversationEnd?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <ModelSelectorSimple 
            selectedModel={modelId} 
            onSelectModel={setModelId}
            deepResearch={deepResearch}
            onToggleDeepResearch={setDeepResearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={enabledTools.length > 1 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowTools(!showTools)}
            className="gap-1.5"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tools</span>
            {enabledTools.length > 1 && (
              <span className="text-xs bg-primary-foreground text-primary rounded-full px-1.5">
                {enabledTools.length}
              </span>
            )}
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleClearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tools Panel */}
      <AnimatePresence>
        {showTools && (
          <ToolsPanel 
            tools={tools} 
            onToggleTool={handleToggleTool}
            onClose={() => setShowTools(false)}
          />
        )}
      </AnimatePresence>

      {/* Messages - Centered Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to CORTEX</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Your AI assistant with persistent memory. I remember our conversations
                  and learn about you over time.
                </p>
                
                {/* Subtle Teach Prompt */}
                <AnimatePresence>
                  {showTeachPrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full max-w-md mb-6"
                    >
                      <TeachCortex minimal onTeach={handleTeachClick} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  <SuggestionCard 
                    text="Tell me about yourself" 
                    onClick={() => setInput("Let me tell you about myself...")} 
                  />
                  <SuggestionCard 
                    text="What do you remember about me?" 
                    onClick={() => setInput("What do you remember about me?")} 
                  />
                  <SuggestionCard 
                    text="Help me brainstorm" 
                    onClick={() => setInput("Help me brainstorm ideas for ")} 
                  />
                  <SuggestionCard 
                    text="Explain a concept" 
                    onClick={() => setInput("Explain the concept of ")} 
                  />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isExpanded={expandedReasoning.has(message.id)}
                    onToggleReasoning={() => {
                      setExpandedReasoning(prev => {
                        const next = new Set(prev);
                        if (next.has(message.id)) {
                          next.delete(message.id);
                        } else {
                          next.add(message.id);
                        }
                        return next;
                      });
                    }}
                  />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground pl-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      {deepResearch ? 'Researching the web...' : 'Thinking...'}
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Centered */}
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// Suggestion card component
function SuggestionCard({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-3 text-left text-sm rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
    >
      {text}
    </button>
  );
}

// Message bubble with reasoning and sources support
interface MessageBubbleProps {
  message: Message;
  isExpanded?: boolean;
  onToggleReasoning?: () => void;
}

function MessageBubble({ message, isExpanded, onToggleReasoning }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const hasReasoning = message.reasoning && message.reasoning.length > 0;
  const hasSources = message.sources && message.sources.length > 0;

  // Deduplicate sources by URL
  const uniqueSources = message.sources?.filter((source, index, self) =>
    index === self.findIndex(s => s.url === source.url)
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-[85%] space-y-2`}>
        {/* Reasoning toggle (Claude thinking / extended reasoning) */}
        {isAssistant && hasReasoning && (
          <button
            onClick={onToggleReasoning}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span className="font-medium">
              {isExpanded ? 'Hide thinking' : 'Show thinking'}
            </span>
          </button>
        )}

        {/* Reasoning content (collapsible) */}
        <AnimatePresence>
          {isExpanded && hasReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-xs uppercase tracking-wide mb-2 text-primary">
                  <Brain className="h-3 w-3" />
                  Thinking
                </div>
                <div className="whitespace-pre-wrap text-xs leading-relaxed">
                  {message.reasoning}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main message content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-muted text-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Sources from web search */}
        {isAssistant && hasSources && uniqueSources.length > 0 && (
          <div className="px-2 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Globe className="h-3 w-3" />
              Sources ({uniqueSources.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSources.slice(0, 5).map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {source.title || new URL(source.url).hostname}
                  </span>
                </a>
              ))}
              {uniqueSources.length > 5 && (
                <span className="text-xs text-muted-foreground py-1">
                  +{uniqueSources.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
