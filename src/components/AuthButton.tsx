'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import commonStyles from '@/styles/common.module.css';

export default function AuthButton() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return session ? (
    <div className="flex items-center space-x-4">
      <span className="text-gray-300 text-lg">こんにちは、{session.user?.email}</span>
      <button
        onClick={handleLogout}
        className={commonStyles.secondaryButton}
      >
        ログアウト
      </button>
    </div>
  ) : (
    <Link href="/login">
      <button className={commonStyles.primaryButton}>
        ログイン
      </button>
    </Link>
  );
}
