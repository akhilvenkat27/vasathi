import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Layers, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const FloorsList = () => {
  const navigate = useNavigate();
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, getFloorsForPG, getRoomsForFloor, addFloor, deleteFloor } = useApp();
  const [open, setOpen] = useState(false);
  const [floorName, setFloorName] = useState('');

  const pg = getPGById(pgId || '');
  const floors = getFloorsForPG(pg?.id || '');

  if (!pg) return <div className="p-8 text-center">PG not found</div>;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addFloor({ pgId: pg.id, name: floorName, slug: floorName.toLowerCase().replace(/\s+/g, '-') });
    setFloorName('');
    setOpen(false);
    toast.success('Floor added!');
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
            <DialogHeader><DialogTitle className="font-display">Add New Floor</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label>Floor Name</Label><Input placeholder="e.g. First Floor" value={floorName} onChange={e => setFloorName(e.target.value)} required /></div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Floor</Button>
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
              <div key={floor.id} className="glass-card rounded-xl p-6 hover-lift">
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
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { deleteFloor(floor.id); toast.success('Floor deleted'); }}>Delete</AlertDialogAction>
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

export default FloorsList;
