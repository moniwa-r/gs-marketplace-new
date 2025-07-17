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
        <h1 className="text-3xl font-bold text-center text-gray-800">Welcome Back!</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`}
          magicLink={true}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign In',
                social_provider_text: 'Or continue with',
                link_text: 'Already have an account? Sign In',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign Up',
                social_provider_text: 'Or continue with',
                link_text: "Don't have an account? Sign Up",
              },
              forgotten_password: {
                email_label: 'Email address',
                password_label: 'Your Password',
                email_input_placeholder: 'Your email address',
                button_label: 'Send reset password instructions',
                link_text: 'Forgot your password?',
              },
              update_password: {
                password_label: 'New Password',
                password_input_placeholder: 'Your new password',
                button_label: 'Update Password',
              },
            },
          }}
        />
      </div>
    </div>
  );
}