import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, MoreVertical, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
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
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const GrievancesPage = () => {
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, grievances, updateGrievanceStatus, bulkUpdateGrievanceStatus } = useApp();

  const pg = getPGById(pgId || '');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [viewGrievance, setViewGrievance] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('pending');
  const [bulkStatusModal, setBulkStatusModal] = useState(false);

  const pgGrievances = grievances.filter(g => g.pgId === pg?.id);

  const filtered = useMemo(() => {
    return pgGrievances.filter(g => {
      if (search && !g.residentName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== 'all' && g.status !== filterStatus) return false;
      return true;
    });
  }, [pgGrievances, search, filterStatus]);

  if (!pg) return <div className="p-8 text-center">PG not found</div>;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === paginated.length ? [] : paginated.map(g => g.id));

  const statusVariant = (s: string) => s === 'closed' ? 'success' : s === 'in_progress' ? 'info' : s === 'on_hold' ? 'warning' : 'destructive';

  const viewing = grievances.find(g => g.id === viewGrievance);

  const handleStatusChange = () => {
    if (statusModal) {
      updateGrievanceStatus(statusModal, newStatus as any);
      setStatusModal(null);
      toast.success('Status updated');
    }
  };

  const handleBulkStatus = () => {
    bulkUpdateGrievanceStatus(selected, newStatus as any);
    setBulkStatusModal(false);
    setSelected([]);
    toast.success(`${selected.length} grievance(s) updated`);
  };

  return (
    <AdminLayout
      title="Grievances"
      subtitle={`${filtered.length} complaint${filtered.length !== 1 ? 's' : ''}`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'Grievances' },
      ]}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by resident name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selected.length === paginated.length && paginated.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No grievances found</TableCell></TableRow>
              ) : (
                paginated.map(g => (
                  <TableRow key={g.id}>
                    <TableCell><Checkbox checked={selected.includes(g.id)} onCheckedChange={() => toggleSelect(g.id)} /></TableCell>
                    <TableCell className="font-medium">{g.residentName}</TableCell>
                    <TableCell className="text-sm">{new Date(g.reportedAt).toLocaleDateString()} {new Date(g.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>{g.floorName}</TableCell>
                    <TableCell>Room {g.roomName}</TableCell>
                    <TableCell><Badge variant={statusVariant(g.status)}>{g.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setViewGrievance(g.id)}><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setStatusModal(g.id); setNewStatus(g.status); }}>Change Status</DropdownMenuItem>
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

      {/* Bulk & Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selected.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => { setBulkStatusModal(true); setNewStatus('pending'); }}>Move</Button>
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

      {/* View Grievance Modal */}
      <Dialog open={!!viewGrievance} onOpenChange={() => setViewGrievance(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Grievance Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reported by</p>
                <p className="font-medium">{viewing.residentName} · Room {viewing.roomName}, {viewing.floorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{viewing.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={statusVariant(viewing.status)}>{viewing.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <Dialog open={!!statusModal} onOpenChange={() => setStatusModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Change Status</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleStatusChange}>Update Status</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Modal */}
      <Dialog open={bulkStatusModal} onOpenChange={setBulkStatusModal}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Bulk Status Change</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Update status for {selected.length} grievance(s)</p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBulkStatus}>Update All</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default GrievancesPage;
