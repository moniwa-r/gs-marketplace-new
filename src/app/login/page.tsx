'use client';

import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/'); // ログインしたらトップページにリダイレクト
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-md p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">おかえりなさい！</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`}
          magicLink={true}
          localization={{
            variables: {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'あなたのメールアドレス',
                password_input_placeholder: 'あなたのパスワード',
                button_label: 'ログイン',
                social_provider_text: 'または以下で続行',
                link_text: 'アカウントをお持ちですか？ ログイン',
              },
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワードを作成',
                email_input_placeholder: 'あなたのメールアドレス',
                password_input_placeholder: 'あなたのパスワード',
                button_label: 'サインアップ',
                social_provider_text: 'または以下で続行',
                link_text: "アカウントをお持ちでないですか？ サインアップ",
              },
              forgotten_password: {
                email_label: 'メールアドレス',
                password_label: 'あなたのパスワード',
                email_input_placeholder: 'あなたのメールアドレス',
                button_label: 'パスワードリセットの指示を送信',
                link_text: 'パスワードをお忘れですか？',
              },
              update_password: {
                password_label: '新しいパスワード',
                password_input_placeholder: '新しいパスワード',
                button_label: 'パスワードを更新',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
