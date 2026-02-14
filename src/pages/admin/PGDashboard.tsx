import { useNavigate, useParams } from 'react-router-dom';
import { Users, Layers, DoorOpen, AlertTriangle, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PGDashboard = () => {
  const navigate = useNavigate();
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, getResidentsForPG, getFloorsForPG, rooms, payments, grievances, separationRequests } = useApp();

  const pg = getPGById(pgId || '');

  if (!pg) return <div className="p-8 text-center">PG not found</div>;

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
    { icon: Users, label: 'Total Residents', value: occupied, color: 'text-info' },
    { icon: DoorOpen, label: 'Empty Slots', value: emptySlots, color: 'text-success' },
    { icon: CreditCard, label: 'Unpaid', value: unpaid, color: 'text-destructive' },
    { icon: AlertTriangle, label: 'Notice Period', value: noticePeriod, color: 'text-warning' },
    { icon: Layers, label: 'Total Floors', value: pgFloors.length, color: 'text-accent' },
    { icon: TrendingUp, label: 'Open Grievances', value: pgGrievances, color: 'text-destructive' },
  ];

  return (
    <AdminLayout
      title={pg.name}
      subtitle={pg.address}
      breadcrumbs={[{ label: pg.name }]}
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate(`/admin/${pg.id}/floors`)}>
            Explore Floors <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Quick Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/admin/${pg.id}/residents`)}>All Residents</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/${pg.id}/grievances`)}>Grievances</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/${pg.id}/separations`)}>Separation Requests</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.label} className="hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'All Residents', desc: 'View & manage all residents', path: `/admin/${pg.id}/residents` },
          { label: 'Grievances', desc: 'Handle resident complaints', path: `/admin/${pg.id}/grievances` },
          { label: 'Separations', desc: 'Manage exit requests', path: `/admin/${pg.id}/separations` },
        ].map(item => (
          <Card key={item.label} className="hover-lift cursor-pointer" onClick={() => navigate(item.path)}>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-foreground mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default PGDashboard;
