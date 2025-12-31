'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <UserIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm hidden sm:inline max-w-[120px] truncate">
          {user.email?.split('@')[0]}
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
