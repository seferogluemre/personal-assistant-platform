import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Arkaplan dekoratif elementler */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      
      <Card className="z-10 w-full max-w-md glass text-white">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Kayıt Ol</CardTitle>
          <CardDescription className="text-zinc-400">
            OpenClaw'a katılmak için yeni bir hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Ad Soyad</Label>
            <Input 
              id="name" 
              placeholder="Adınız Soyadınız" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-11"
            />
          </div>
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
            <Label htmlFor="password" className="text-zinc-300">Şifre</Label>
            <Input 
              id="password" 
              type="password" 
              className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500/50 h-11" 
            />
          </div>
          <Button className="w-full bg-white text-black hover:bg-zinc-200 transition-all font-semibold h-11 mt-2">
            Hesap Oluştur
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center pt-4 border-t border-white/5 mt-4">
          <div className="text-sm text-zinc-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold text-white hover:text-indigo-400 transition-all">
              Giriş Yap
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
