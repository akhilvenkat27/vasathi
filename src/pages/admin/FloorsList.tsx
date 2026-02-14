import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Layers, Trash2, ArrowRight, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import ImageSlideshow from '@/components/ImageSlideshow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { useState } from 'react';
import { Floor } from '../types';


const FloorsList = () => {
  const navigate = useNavigate();
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, getFloorsForPG, getRoomsForFloor, addFloor, updateFloor, deleteFloor, uploadMultipleImages } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editFloor, setEditFloor] = useState<Floor | null>(null);
  const [form, setForm] = useState({ name: '', photos: [] as string[] });

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
  const floors = getFloorsForPG(pg?.id || '');

  if (!pg) return <div className="p-8 text-center">PG not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editFloor) {
        await updateFloor(editFloor.id, { name: form.name, photos: form.photos });
        toast.success('Floor updated!');
      } else {
        await addFloor({ pgId: pg.id, name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'), photos: form.photos });
        toast.success('Floor added!');
      }
      setForm({ name: '', photos: [] });
      setOpen(false);
      setEditFloor(null);
    } catch (e) {
      toast.error('Failed to save floor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (floor: Floor) => {
    setEditFloor(floor);
    setForm({ name: floor.name, photos: floor.photos || [] });
    setOpen(true);
  };

  return (
    <AdminLayout
      title="Floors"
      subtitle={`Manage floors for ${pg.name}`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'Floors' },
      ]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" /> Add Floor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editFloor ? 'Edit Floor' : 'Add New Floor'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Floor Name</Label><Input placeholder="e.g. First Floor" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div>
                <Label>Floor Photos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.photos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                      <img src={p} alt="Floor" className="w-full h-full object-cover" />
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
              <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (editFloor ? 'Save Changes' : 'Add Floor')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {floors.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Floors Yet</h3>
          <p className="text-muted-foreground">Add your first floor to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map(floor => {
            const roomCount = getRoomsForFloor(floor.id).length;
            return (
              <div key={floor.id} className="glass-card rounded-xl overflow-hidden hover-lift p-0 border-0 shadow-lg shadow-slate-200/50">
                <ImageSlideshow images={floor.photos?.length ? floor.photos : []} className="h-40" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-accent/10"><Layers className="h-6 w-6 text-accent" /></div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">{floor.name}</h3>
                      <p className="text-sm text-muted-foreground">{roomCount} room{roomCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate(`/admin/${pg.id}/floors/${floor.id}`)}>
                      Explore <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(floor)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {floor.name}?</AlertDialogTitle>
                          <AlertDialogDescription>This will delete this floor and all its rooms and residents.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteFloor(floor.id); toast.success('Floor deleted'); }}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default FloorsList;
