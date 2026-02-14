import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, DoorOpen, Trash2, ArrowRight, Snowflake, Fan } from 'lucide-react';
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

const RoomsList = () => {
  const navigate = useNavigate();
  const { pgId, floorId } = useParams<{ pgId: string; floorId: string }>();
  const { getPGById, getFloorById, getRoomsForFloor, getResidentsForRoom, addRoom, deleteRoom } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sharingType: 'Single', acType: 'ac' as 'ac' | 'non_ac', capacity: 1, rent: 0 });

  const pg = getPGById(pgId || '');
  const floor = getFloorById(floorId || '');
  const roomsList = getRoomsForFloor(floor?.id || '');

  if (!pg || !floor) return <div className="p-8 text-center">Not found</div>;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom({ ...form, floorId: floor.id, pgId: pg.id });
    setForm({ name: '', sharingType: 'Single', acType: 'ac', capacity: 1, rent: 0 });
    setOpen(false);
    toast.success('Room added!');
  };

  return (
    <AdminLayout
      title={floor.name}
      subtitle={`Rooms on ${floor.name}`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'Floors', path: `/admin/${pg.id}/floors` },
        { label: floor.name },
      ]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add New Room</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label>Room Name/Number</Label><Input placeholder="e.g. 101" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><Label>Sharing Type</Label>
                <Select value={form.sharingType} onValueChange={v => setForm(p => ({ ...p, sharingType: v, capacity: v === 'Single' ? 1 : v === 'Double' ? 2 : v === 'Triple' ? 3 : 4 }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Triple">Triple</SelectItem>
                    <SelectItem value="Quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>AC Type</Label>
                <Select value={form.acType} onValueChange={v => setForm(p => ({ ...p, acType: v as 'ac' | 'non_ac' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac">AC</SelectItem>
                    <SelectItem value="non_ac">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Monthly Rent (₹)</Label><Input type="number" value={form.rent} onChange={e => setForm(p => ({ ...p, rent: Number(e.target.value) }))} required /></div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Room</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {roomsList.length === 0 ? (
        <div className="text-center py-20">
          <DoorOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Rooms Yet</h3>
          <p className="text-muted-foreground">Add your first room to this floor.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomsList.map(room => {
            const occupants = getResidentsForRoom(room.id).length;
            return (
              <div key={room.id} className="glass-card rounded-xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-display font-bold text-foreground">Room {room.name}</h3>
                  {room.acType === 'ac' ? <Snowflake className="h-4 w-4 text-info" /> : <Fan className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{room.sharingType}</Badge>
                  <Badge variant={occupants >= room.capacity ? 'destructive' : 'success'}>{occupants}/{room.capacity} occupied</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">₹{room.rent.toLocaleString()}/month</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate(`/admin/${pg.id}/floors/${floor.id}/${room.id}`)}>
                    Explore <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Room {room.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will delete this room and all its residents.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { deleteRoom(room.id); toast.success('Room deleted'); }}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default RoomsList;
