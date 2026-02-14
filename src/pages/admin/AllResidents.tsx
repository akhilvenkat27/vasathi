import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Filter, MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const AllResidents = () => {
  const navigate = useNavigate();
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, getResidentsForPG, floors, rooms, addPayment, removeResident, bulkRemoveResidents } = useApp();

  const pg = getPGById(pgId || '');
  const allResidents = getResidentsForPG(pg?.id || '');

  const [search, setSearch] = useState('');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<string[]>([]);
  const [payForm, setPayForm] = useState({
    month: new Date().toLocaleString('default', { month: 'short' }),
    year: new Date().getFullYear().toString(),
    type: 'rent' as any,
    status: 'paid' as any,
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);

  const pgFloors = floors.filter(f => f.pgId === pg?.id);
  const pgRooms = rooms.filter(r => r.pgId === pg?.id);

  const filtered = useMemo(() => {
    if (!pg) return [];
    return allResidents.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterFloor !== 'all' && r.floorId !== filterFloor) return false;
      if (filterRoom !== 'all' && r.roomId !== filterRoom) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterGender !== 'all' && r.gender !== filterGender) return false;
      return true;
    });
  }, [allResidents, search, filterFloor, filterRoom, filterStatus, filterGender, pg]);

  if (!pg) return <div className="p-8 text-center">PG not found</div>;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === paginated.length ? [] : paginated.map(r => r.id));

  const getFloorName = (id: string) => floors.find(f => f.id === id)?.name || '';
  const getRoomName = (id: string) => rooms.find(r => r.id === id)?.name || '';

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all(payTarget.map(rid => addPayment({
        period: `${payForm.month} ${payForm.year}`,
        type: payForm.type,
        status: payForm.status,
        amount: payForm.amount,
        date: payForm.date,
        residentId: rid
      })));
      setPayOpen(false);
      setPayTarget([]);
      setSelected([]);
      toast.success(`Payment added for ${payTarget.length} resident(s)`);
    } catch (error) {
      toast.error('Failed to add payment. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await bulkRemoveResidents(deleteTargets);
      setDeleteConfirm(false);
      setDeleteTargets([]);
      setSelected([]);
      toast.success('Resident(s) removed');
    } catch (error) {
      toast.error('Failed to remove resident(s). Please try again.');
    }
  };

  const statusVariant = (s: string) => s === 'monthly' ? 'success' : s === 'daily' ? 'info' : 'warning';

  const clearFilters = () => {
    setFilterFloor('all');
    setFilterRoom('all');
    setFilterStatus('all');
    setFilterGender('all');
  };

  return (
    <AdminLayout
      title="All Residents"
      subtitle={`${filtered.length} resident${filtered.length !== 1 ? 's' : ''} found`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'All Residents' },
      ]}
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search residents..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3" align="end">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Filters</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" /> Clear</Button>
            </div>
            <div><Label className="text-xs">Floor</Label>
              <Select value={filterFloor} onValueChange={v => { setFilterFloor(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {pgFloors.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Room</Label>
              <Select value={filterRoom} onValueChange={v => { setFilterRoom(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {pgRooms.map(r => <SelectItem key={r.id} value={r.id}>Room {r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Status</Label>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="notice_period">Notice Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Gender</Label>
              <Select value={filterGender} onValueChange={v => { setFilterGender(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selected.length === paginated.length && paginated.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No residents found</TableCell></TableRow>
              ) : (
                paginated.map(r => (
                  <TableRow key={r.id}>
                    <TableCell><Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggleSelect(r.id)} /></TableCell>
                    <TableCell>
                      <button className="font-medium text-foreground hover:text-accent transition-colors text-left" onClick={() => navigate(`/admin/${pg.id}/residents/${r.id}`)}>
                        {r.name}
                      </button>
                      <p className="text-xs text-muted-foreground">{r.customId}</p>
                    </TableCell>
                    <TableCell className="capitalize">{r.gender}</TableCell>
                    <TableCell>{r.joinedDate}</TableCell>
                    <TableCell>{getFloorName(r.floorId)}</TableCell>
                    <TableCell>Room {getRoomName(r.roomId)}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.status)}>{r.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setPayTarget([r.id]); setPayOpen(true); }}>
                            <Plus className="h-3.5 w-3.5 mr-2" /> Add Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTargets([r.id]); setDeleteConfirm(true); }}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bulk Actions & Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selected.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => { setPayTarget(selected); setPayOpen(true); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Payment
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setDeleteTargets(selected); setDeleteConfirm(true); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                <Select value={payForm.month} onValueChange={v => setPayForm(p => ({ ...p, month: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select value={payForm.year} onValueChange={v => setPayForm(p => ({ ...p, year: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Type</Label>
              <Select value={payForm.type} onValueChange={v => setPayForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={payForm.status} onValueChange={v => setPayForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount (₹)</Label><Input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: Number(e.target.value) }))} required /></div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Payment</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTargets.length} resident(s)?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All payment records will also be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AllResidents;
