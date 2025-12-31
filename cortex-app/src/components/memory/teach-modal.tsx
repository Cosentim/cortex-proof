'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Check } from 'lucide-react';

interface TeachModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TeachModal({ open, onClose, onSuccess }: TeachModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ memoriesCreated: number; summary: string } | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          memoriesCreated: data.memoriesCreated,
          summary: data.summary,
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to teach:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogClose onClick={handleClose} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Teach CORTEX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <p className="text-sm text-muted-foreground">
                Paste any text about yourself - your bio, interests, work history,
                preferences, or anything you&apos;d like me to remember. I&apos;ll extract
                meaningful memories automatically.
              </p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here... Could be your LinkedIn bio, a personal description, your work preferences, etc."
                className="min-h-[200px]"
                disabled={loading}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!content.trim() || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract Memories
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {result.memoriesCreated} memories created!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {result.summary}
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
