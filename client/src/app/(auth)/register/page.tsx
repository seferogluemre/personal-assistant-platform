import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'OpenClaw — Kayıt Ol',
  description: 'OpenClaw AI asistanına kayıt olun',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Sol Panel — Form */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen bg-white px-10 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-black">openclaw</span>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
          <p className="text-sm text-gray-500 mb-7">Join OpenClaw! Select method to register:</p>

          {/* Social Buttons */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 h-10">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </Button>
            <Button variant="outline" className="flex-1 text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 h-10">
              <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign up with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">Or continue with Email</span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Full Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                className="h-10 border-gray-200 text-sm placeholder:text-gray-400 focus-visible:ring-black"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email address<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-10 border-gray-200 text-sm placeholder:text-gray-400 focus-visible:ring-black"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password<span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="h-10 border-gray-200 text-sm focus-visible:ring-black"
              />
            </div>
          </div>

          {/* Submit */}
          <Button className="w-full h-10 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-md mb-5">
            Create Account
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-700 font-medium hover:text-black transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Sağ Panel — Karanlık Vitrin */}
      <div className="hidden lg:flex flex-col w-1/2 min-h-screen bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span className="text-[200px] font-black text-white/5 leading-none tracking-tighter">OC</span>
        </div>
        <div className="relative z-10 p-12 pt-16 flex-1">
          <h2 className="text-4xl font-bold text-white leading-tight max-w-xs">
            Start your journey with OpenClaw today
          </h2>
          <p className="mt-4 text-sm text-gray-400 max-w-xs leading-relaxed">
            Create an account and get access to our powerful AI assistant. Your data stays private and secure.
          </p>
        </div>
        <div className="relative z-10 m-8 mt-0">
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4">
            <div className="flex-1">
              <p className="font-bold text-black text-base mb-1">Ready to get started?</p>
              <p className="text-sm text-gray-500">Join hundreds of teams using OpenClaw to supercharge their workflow.</p>
            </div>
            <div className="w-10 h-10 bg-black rounded-full flex-shrink-0 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
