import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Layers, DoorOpen, AlertTriangle, CreditCard, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddTenantWizard from '@/components/AddTenantWizard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PGDashboard = () => {
  const navigate = useNavigate();
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, getResidentsForPG, getFloorsForPG, rooms, payments, grievances, separationRequests, fetchData } = useApp();
  const [wizardOpen, setWizardOpen] = useState(false);

  const pg = getPGById(pgId || '');

  if (!pg) return <div className="p-8 text-center bg-slate-50 min-h-screen">Residence not found</div>;

  const pgResidents = getResidentsForPG(pg.id);
  const pgFloors = getFloorsForPG(pg.id);
  const pgRooms = rooms.filter(r => r.pgId === pg.id);
  const totalCapacity = pgRooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupied = pgResidents.length;
  const emptySlots = totalCapacity - occupied;
  const unpaid = pgResidents.filter(r => {
    const latestPay = payments.filter(p => p.residentId === r.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return !latestPay || latestPay.status !== 'paid';
  }).length;
  const noticePeriod = pgResidents.filter(r => r.status === 'notice_period').length;
  const pgGrievances = grievances.filter(g => g.pgId === pg.id && g.status !== 'closed').length;

  const stats = [
    { icon: Users, label: 'Residents', value: occupied, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: DoorOpen, label: 'Empty Slots', value: emptySlots, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: CreditCard, label: 'Unpaid', value: unpaid, color: 'text-red-600', bg: 'bg-red-50' },
    { icon: AlertTriangle, label: 'Notice Period', value: noticePeriod, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Layers, label: 'Floors', value: pgFloors.length, color: 'text-accent', bg: 'bg-accent/5' },
    { icon: TrendingUp, label: 'Grievances', value: pgGrievances, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminLayout
      title={pg.name}
      subtitle={pg.address}
      breadcrumbs={[{ label: pg.name }]}
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-6 rounded-xl font-bold shadow-lg shadow-accent/20" onClick={() => navigate(`/admin/${pg.id}/floors`)}>
            Manage Property <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl font-bold border-2">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl p-2 min-w-[180px]">
              <DropdownMenuItem className="rounded-xl h-10 font-bold" onClick={() => setWizardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Tenant
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl h-10 font-bold" onClick={() => navigate(`/admin/${pg.id}/residents`)}>All Residents</DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl h-10 font-bold" onClick={() => navigate(`/admin/${pg.id}/grievances`)}>Grievances</DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl h-10 font-bold" onClick={() => navigate(`/admin/${pg.id}/separations`)}>Separation Requests</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden h-[90vh] sm:h-[600px] border-0 rounded-3xl shadow-2xl">
          <AddTenantWizard
            pgId={pg.id}
            onComplete={async () => {
              setWizardOpen(false);
              await fetchData();
              toast.success('Tenant added successfully');
            }}
            onCancel={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map(s => (
          <Card key={s.label} className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-3xl">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${s.color}`}>
                <s.icon className="h-7 w-7" />
              </div>
              <p className="text-3xl font-black font-display text-foreground leading-none">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-3">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { label: 'Residents Hub', desc: 'Active tenants & records', path: `/admin/${pg.id}/residents`, icon: Users },
          { label: 'Issue Tracker', desc: 'Complaints and maintenance', path: `/admin/${pg.id}/grievances`, icon: TrendingUp },
          { label: 'Exit Management', desc: 'Notices and departures', path: `/admin/${pg.id}/separations`, icon: AlertTriangle },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-[2.5rem] p-4 cursor-pointer group" onClick={() => navigate(item.path)}>
            <CardContent className="p-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-black text-foreground mb-2">{item.label}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout >
  );
};

export default PGDashboard;
