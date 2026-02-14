import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, MapPin, Phone, Trash2, ArrowRight, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import ImageSlideshow from '@/components/ImageSlideshow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { PG } from '../types';

const PGList = () => {
  const navigate = useNavigate();
  const { pgs, addPG, updatePG, deletePG, currentUser, uploadMultipleImages } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editPG, setEditPG] = useState<PG | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', address: '', contact: '', photos: [] as string[] });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const urls = await uploadMultipleImages(files);
        setForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
        toast.success('Photos uploaded');
      } catch (error) {
        toast.error('Failed to upload photos');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  if (!currentUser || currentUser.type !== 'admin') {
    navigate('/login?type=admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editPG) {
        await updatePG(editPG.id, form);
        toast.success('Residence updated!');
      } else {
        await addPG({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-') });
        toast.success('Residence added!');
      }
      setForm({ name: '', slug: '', description: '', address: '', contact: '', photos: [] });
      setOpen(false);
      setEditPG(null);
    } catch (error) {
      toast.error('Operation failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (pg: PG) => {
    setEditPG(pg);
    setForm({ name: pg.name, slug: pg.slug, description: pg.description, address: pg.address, contact: pg.contact, photos: pg.photos || [] });
    setOpen(true);
  };

  return (
    <AdminLayout
      title="Property Portfolio"
      subtitle="Manage your Vasathi residences"
      actions={
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setEditPG(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 rounded-full font-bold">
              <Plus className="h-4 w-4 mr-2" /> Add Residence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-black">{editPG ? 'Edit Residence' : 'Add New Residence'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Name</Label><Input placeholder="e.g. Vasathi Heights" className="rounded-xl h-12" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Address</Label><Input placeholder="Full address" className="rounded-xl h-12" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required /></div>
              <div><Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Contact</Label><Input placeholder="+91 9876543210" className="rounded-xl h-12" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} required /></div>
              <div><Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Description</Label><Textarea placeholder="Brief description" className="rounded-xl resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div>
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Photos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.photos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={p} alt="PG" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-xl hover:bg-red-600 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <label className={`w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImageIcon className={`h-6 w-6 text-slate-300 ${isUploading ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold text-slate-400 mt-1">{isUploading ? '...' : 'ADD'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 rounded-2xl font-black text-lg">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (editPG ? 'Save Changes' : 'Add Residence')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {pgs.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
            <Building2 className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-display font-black text-foreground mb-2">No Residences Yet</h3>
          <p className="text-muted-foreground font-medium">Start by adding your first premium property.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pgs.map(pg => (
            <div key={pg.id} className="bg-white rounded-[2rem] overflow-hidden hover-lift p-0 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
              <ImageSlideshow images={pg.photos?.length ? pg.photos : (pg.image ? [pg.image] : [])} className="h-56" />
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display font-black text-foreground">{pg.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(pg)} className="h-8 rounded-full font-bold text-accent hover:bg-accent/5">Edit</Button>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-5 line-clamp-2">{pg.description}</p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <MapPin className="h-4 w-4 text-accent" /> <span className="truncate">{pg.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <Phone className="h-4 w-4 text-accent" /> {pg.contact}
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 rounded-xl font-black shadow-lg shadow-accent/20" onClick={() => navigate(`/admin/${pg.id}`)}>
                      Explore Property <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl border-0 shadow-2xl bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black">Delete {pg.name}?</AlertDialogTitle>
                          <AlertDialogDescription className="font-medium">
                            Are you sure? This action is permanent and will wipe all associated data for this property.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-4">
                          <AlertDialogCancel className="rounded-xl font-bold border-2">Keep Property</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold" onClick={async () => { await deletePG(pg.id); toast.success('Residence deleted'); }}>Confirm Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default PGList;
