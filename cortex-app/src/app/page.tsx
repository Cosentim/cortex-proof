'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat';
import { MemoryDrawer } from '@/components/memory';

export default function Home() {
  const router = useRouter();
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        onOpenMemories={() => setMemoryDrawerOpen(true)}
        onOpenSettings={() => router.push('/settings')}
      />
      <MemoryDrawer
        isOpen={memoryDrawerOpen}
        onClose={() => setMemoryDrawerOpen(false)}
      />
    </div>
  );
}
