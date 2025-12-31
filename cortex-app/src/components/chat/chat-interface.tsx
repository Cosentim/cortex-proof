'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelectorSimple } from './model-selector-simple';
import { ToolsPanel, type Tool } from './tools-panel';
import { TeachCortex } from '@/components/cortex';
import { Button } from '@/components/ui/button';
import { Brain, Trash2, Wrench } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

export function ChatInterface({ showTeachPrompt, onDismissTeachPrompt, onTeach, onConversationEnd }: ChatInterfaceProps) {
  const [modelId, setModelId] = useState<string>('gpt-4o-mini');
  const [deepResearch, setDeepResearch] = useState(false);
  const [tools, setTools] = useState<Tool[]>(AVAILABLE_TOOLS);
  const [showTools, setShowTools] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      let assistantContent = '';

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantContent += decoder.decode(value, { stream: true });
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id ? { ...m, content: assistantContent } : m
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
              <MessageList messages={messages} isLoading={isLoading} />
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
