import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, MapPin, Phone, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const PGList = () => {
  const navigate = useNavigate();
  const { pgs, addPG, deletePG, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', address: '', contact: '', image: '' });

  if (!currentUser || currentUser.type !== 'admin') {
    navigate('/login?type=admin');
    return null;
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPG({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-') });
    setForm({ name: '', slug: '', description: '', address: '', contact: '', image: '' });
    setOpen(false);
    toast.success('Residence added successfully!');
  };

  return (
    <AdminLayout
      title="Your Residences"
      subtitle="Manage all your PG properties in one place"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" /> Add Residence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Residence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label>Name</Label><Input placeholder="e.g. Helios Residency" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><Label>Address</Label><Input placeholder="Full address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required /></div>
              <div><Label>Contact</Label><Input placeholder="+91 9876543210" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} required /></div>
              <div><Label>Description</Label><Textarea placeholder="Brief description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Residence</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {pgs.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-muted-foreground mb-2">No Residences Yet</h3>
          <p className="text-muted-foreground">Click "Add Residence" to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pgs.map(pg => (
            <div key={pg.id} className="glass-card rounded-xl overflow-hidden hover-lift">
              <div className="h-40 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-accent/60" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">{pg.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pg.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5" /> <span className="truncate">{pg.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Phone className="h-3.5 w-3.5" /> {pg.contact}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate(`/admin/${pg.id}`)}>
                    Explore <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {pg.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this residence and all its data including floors, rooms, and residents.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { deletePG(pg.id); toast.success('Residence deleted'); }}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
