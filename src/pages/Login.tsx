import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
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
      toast.success('Welcome back!');
      navigate('/resident');
    } else {
      toast.error('Resident ID not found. Try: HEL001');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-accent" />
            <span className="text-2xl font-display font-bold text-foreground">NestManager</span>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="resident">Resident</TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@nestmanager.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Sign In as Admin</Button>
              </form>
            </TabsContent>

            <TabsContent value="resident">
              <form onSubmit={handleResidentLogin} className="space-y-4">
                <div>
                  <Label htmlFor="residentId">Resident ID</Label>
                  <Input id="residentId" placeholder="e.g. HEL001" value={residentId} onChange={e => setResidentId(e.target.value)} required />
                </div>
                <p className="text-xs text-muted-foreground">Enter the Resident ID provided by your PG admin.</p>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Sign In as Resident</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
