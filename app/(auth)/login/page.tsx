'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setForgotSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-neutral-950 to-neutral-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">VendorBridge</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Procurement,<br />
            <span className="text-blue-400">simplified.</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
            Manage vendors, RFQs, quotations, approvals, and invoices in one centralized platform.
          </p>

          <div className="space-y-3 pt-4">
            {[
              { icon: '📋', text: 'Create & manage RFQs instantly' },
              { icon: '⚖️', text: 'Compare quotations side-by-side' },
              { icon: '✅', text: 'Structured approval workflows' },
              { icon: '📄', text: 'Auto-generate POs & invoices' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-neutral-300 text-sm">
                <span className="text-base">{icon}</span>
                {text}
              </div>
             ))}
          </div>
        </div>

        <div className="relative z-10 text-neutral-600 text-xs">
          © 2025 VendorBridge. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">VendorBridge</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            {!showForgot ? (
              <>
                <div className="mb-7">
                  <h2 className="text-xl font-semibold text-white mb-1">Sign in to your account</h2>
                  <p className="text-neutral-400 text-sm">Enter your credentials to continue</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-neutral-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors mt-2"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Create account
                  </Link>
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setShowForgot(false); setForgotSuccess(false); setError(''); }}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm mb-6 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to sign in
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Reset password</h2>
                  <p className="text-neutral-400 text-sm">We&apos;ll send you a reset link</p>
                </div>

                {forgotSuccess ? (
                  <div className="px-4 py-3 bg-green-950 border border-green-800 rounded-lg text-green-300 text-sm">
                    Password reset link sent! Check your email.
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {error && (
                      <div className="px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="you@company.com"
                      />
                    </div>
  
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
                     >
                      {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}