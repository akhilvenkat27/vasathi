import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, User, Trash2, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const RoomDetail = () => {
  const navigate = useNavigate();
  const { pgId, floorId, roomId } = useParams<{ pgId: string; floorId: string; roomId: string }>();
  const { getPGById, getFloorById, getRoomById, getResidentsForRoom, addResident, removeResident } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', occupation: '', aadharNumber: '',
    gender: 'male' as 'male' | 'female' | 'other',
    status: 'monthly' as 'daily' | 'monthly' | 'notice_period',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  const pg = getPGById(pgId || '');
  const floor = getFloorById(floorId || '');
  const room = getRoomById(roomId || '');
  const residents = getResidentsForRoom(room?.id || '');

  if (!pg || !floor || !room) return <div className="p-8 text-center">Not found</div>;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addResident({
        ...form, roomId: room.id, floorId: floor.id, pgId: pg.id, profileImage: '',
      });
      setForm({ name: '', email: '', phone: '', occupation: '', aadharNumber: '', gender: 'male', status: 'monthly', joinedDate: new Date().toISOString().split('T')[0] });
      setOpen(false);
      toast.success('Resident added!');
    } catch (error) {
      toast.error('Failed to add resident. Please try again.');
    }
  };

  const statusVariant = (s: string) => s === 'monthly' ? 'success' : s === 'daily' ? 'info' : 'warning';

  return (
    <AdminLayout
      title={`Room ${room.name}`}
      subtitle={`${room.sharingType} sharing · ${room.acType === 'ac' ? 'AC' : 'Non-AC'} · ₹${room.rent.toLocaleString()}/month`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'Floors', path: `/admin/${pg.id}/floors` },
        { label: floor.name, path: `/admin/${pg.id}/floors/${floor.id}` },
        { label: `Room ${room.name}` },
      ]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={residents.length >= room.capacity}>
              <Plus className="h-4 w-4 mr-2" /> Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Add New Resident</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
              <div><Label>Occupation</Label><Input value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} /></div>
              <div><Label>Aadhar Number</Label><Input value={form.aadharNumber} onChange={e => setForm(p => ({ ...p, aadharNumber: e.target.value }))} required /></div>
              <div><Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="notice_period">Notice Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Joined Date</Label><Input type="date" value={form.joinedDate} onChange={e => setForm(p => ({ ...p, joinedDate: e.target.value }))} required /></div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Resident</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-4">
        <Badge variant={residents.length >= room.capacity ? 'destructive' : 'success'}>
          {residents.length}/{room.capacity} Occupied
        </Badge>
      </div>

      {residents.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Residents</h3>
          <p className="text-muted-foreground">Add the first resident to this room.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {residents.map(r => (
            <div key={r.id} className="glass-card rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.customId} · {r.occupation}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={statusVariant(r.status)}>{r.status.replace('_', ' ')}</Badge>
                    <Badge variant="secondary">{r.gender}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/admin/${pg.id}/residents/${r.id}`)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {r.name}?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove this resident and all their payment records.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { try { await removeResident(r.id); toast.success('Resident removed'); } catch { toast.error('Failed to remove resident'); } }}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default RoomDetail;
