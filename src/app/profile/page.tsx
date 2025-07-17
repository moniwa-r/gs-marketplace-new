'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import profileStyles from './profile.module.css';
import commonStyles from '@/styles/common.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // ログインしていない場合はログインページへ
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return <div className={commonStyles.container}><p className={commonStyles.loadingMessage}>プロフィールを読み込み中...</p></div>;
  }

  if (!user) {
    return null; // リダイレクト済み
  }

  return (
    <main className={profileStyles.container}>
      <h1 className={profileStyles.heading}>あなたのプロフィール</h1>
      <div className={profileStyles.profileCard}>
        <div className={profileStyles.profileItem}>
          <span className={profileStyles.label}>メールアドレス:</span>
          <span className={profileStyles.value}>{user.email}</span>
        </div>
        {/* 他のユーザー情報もここに追加できます */}
        <div className={profileStyles.profileItem}>
          <span className={profileStyles.label}>ユーザーID:</span>
          <span className={profileStyles.value}>{user.id}</span>
        </div>
      </div>
    </main>
  );
}