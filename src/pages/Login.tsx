import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft, ShieldCheck, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'resident' ? 'resident' : 'admin';
  const { loginAsAdmin, loginAsResident } = useApp();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [residentId, setResidentId] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsAdmin(adminEmail, adminPassword)) {
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleResidentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsResident(residentId)) {
      toast.success('Welcome back to Vasathi!');
      navigate('/resident');
    } else {
      toast.error('Resident ID not found. Contact your admin.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Abstract Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-accent mb-8 transition-all group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
          </button>

          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl font-black tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="text-accent">Vasa</span>
              <span style={{ color: '#7d9fad' }}>thi.</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium">Elevating your living experience.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/60 border border-slate-100">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-50 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="admin" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <ShieldCheck className="h-4 w-4 mr-2" /> Admin
              </TabsTrigger>
              <TabsTrigger value="resident" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <UserCircle className="h-4 w-4 mr-2" /> Resident
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">Admin Email</Label>
                  <Input id="email" type="email" placeholder="admin@vasathi.com" className="h-14 rounded-2xl border-slate-100 focus:ring-accent bg-slate-50/50" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password" title="Hint: any password works for now" className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">Security Key</Label>
                  <Input id="password" type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-100 focus:ring-accent bg-slate-50/50" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 rounded-2xl font-black text-lg shadow-lg shadow-accent/10 transition-transform active:scale-95">
                  Secure Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="resident">
              <form onSubmit={handleResidentLogin} className="space-y-6">
                <div>
                  <Label htmlFor="residentId" className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">Resident Access ID</Label>
                  <Input id="residentId" placeholder="e.g. VAS123456" className="h-14 rounded-2xl border-slate-100 focus:ring-accent bg-slate-50/50 font-display font-bold uppercase tracking-widest" value={residentId} onChange={e => setResidentId(e.target.value)} required />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">Help Note</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Your Access ID is generated at the time of onboarding. If you forgotten yours, please contact the property desk.</p>
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 rounded-2xl font-black text-lg shadow-lg shadow-accent/10 transition-transform active:scale-95">
                  Access Portal
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
          Powered by Vasathi OS
        </p>
      </div>
    </div>
  );
};

export default Login;
