import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, DoorOpen, Trash2, ArrowRight, Snowflake, Fan, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import ImageSlideshow from '@/components/ImageSlideshow';
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
import { Room } from '../types';

const RoomsList = () => {
  const navigate = useNavigate();
  const { pgId, floorId } = useParams<{ pgId: string; floorId: string }>();
  const { getPGById, getFloorById, getRoomsForFloor, getResidentsForRoom, addRoom, updateRoom, deleteRoom, uploadMultipleImages } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ name: '', sharingType: 'Single', acType: 'ac' as 'ac' | 'non_ac', capacity: 1, rent: 0, photos: [] as string[] });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const urls = await uploadMultipleImages(files);
        setForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const pg = getPGById(pgId || '');
  const floor = getFloorById(floorId || '');
  const roomsList = getRoomsForFloor(floor?.id || '');

  if (!pg || !floor) return <div className="p-8 text-center">Not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editRoom) {
        await updateRoom(editRoom.id, form);
        toast.success('Room updated!');
      } else {
        await addRoom({ ...form, floorId: floor.id, pgId: pg.id });
        toast.success('Room added!');
      }
      setForm({ name: '', sharingType: 'Single', acType: 'ac', capacity: 1, rent: 0, photos: [] });
      setOpen(false);
      setEditRoom(null);
    } catch (e) {
      toast.error('Failed to save room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
    setForm({ name: room.name, sharingType: room.sharingType, acType: room.acType, capacity: room.capacity, rent: room.rent, photos: room.photos || [] });
    setOpen(true);
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
            <DialogHeader><DialogTitle className="font-display">{editRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <Label>Room Photos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.photos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                      <img src={p} alt="Room" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md hover:bg-black/70">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className={`w-16 h-16 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:bg-accent/5 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImageIcon className={`h-6 w-6 text-muted-foreground ${isUploading ? 'animate-pulse' : ''}`} />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div><Label>Monthly Rent (₹)</Label><Input type="number" value={form.rent} onChange={e => setForm(p => ({ ...p, rent: Number(e.target.value) }))} required /></div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (editRoom ? 'Save Changes' : 'Add Room')}
              </Button>
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
              <div key={room.id} className="glass-card rounded-xl overflow-hidden hover-lift p-0 border-0 shadow-lg shadow-slate-200/50">
                <ImageSlideshow images={room.photos?.length ? room.photos : []} className="h-56" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-display font-bold text-foreground">Room {room.name}</h3>
                    {room.acType === 'ac' ? <Snowflake className="h-4 w-4 text-info" /> : <Fan className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{room.sharingType}</Badge>
                    <Badge variant={occupants >= room.capacity ? 'destructive' : 'success'}>{occupants}/{room.capacity} occupied</Badge>
                  </div>

                  {/* Resident Images */}
                  <div className="flex -space-x-2 mb-4">
                    {getResidentsForRoom(room.id).map(res => (
                      <div key={res.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden" title={res.name}>
                        <img src={res.profileImage || `https://i.pravatar.cc/100?u=${res.id}`} alt={res.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {occupants === 0 && <span className="text-xs text-muted-foreground italic">Vacant</span>}
                  </div>

                  <p className="text-sm font-bold text-foreground mb-4">₹{room.rent.toLocaleString()}/month</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate(`/admin/${pg.id}/floors/${floor.id}/${room.id}`)}>
                      Explore <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(room)}>
                      Edit
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
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteRoom(room.id); toast.success('Room deleted'); }}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )
      }
    </AdminLayout>
  );
};

export default RoomsList;
