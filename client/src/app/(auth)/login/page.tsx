import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Arkaplan dekoratif elementler */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      
      <Card className="z-10 w-full max-w-md glass text-white">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Hoş Geldiniz</CardTitle>
          <CardDescription className="text-zinc-400">
            OpenClaw asistanına erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="isim@sirket.com" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-300">Şifre</Label>
              <Link href="#" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                Şifremi unuttum?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500/50 h-11" 
            />
          </div>
          <Button className="w-full bg-white text-black hover:bg-zinc-200 transition-all font-semibold h-11 mt-2">
            Giriş Yap
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center pt-4 border-t border-white/5 mt-4">
          <div className="text-sm text-zinc-400">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-white hover:text-indigo-400 transition-all">
              Kayıt Ol
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
