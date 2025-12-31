'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/chat';
import { MemoryDrawer } from '@/components/memory';

export default function Home() {
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        onOpenMemories={() => setMemoryDrawerOpen(true)}
      />
      <MemoryDrawer
        isOpen={memoryDrawerOpen}
        onClose={() => setMemoryDrawerOpen(false)}
      />
    </div>
  );
}
