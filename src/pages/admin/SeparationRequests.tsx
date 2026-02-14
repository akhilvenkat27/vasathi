import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const SeparationRequests = () => {
  const { pgId } = useParams<{ pgId: string }>();
  const { getPGById, separationRequests, getResidentById, approveSeparation, rejectSeparation, isLoading } = useApp();

  const pg = getPGById(pgId || '');

  const [actModal, setActModal] = useState<string | null>(null);
  const [exitDate, setExitDate] = useState('');

  // Pagination & Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!pg) {
    if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="h-12 w-12 border-4 border-slate-100 border-t-accent rounded-full animate-spin" /></div>;
    return <div className="p-8 text-center">PG not found</div>;
  }

  const pgSeps = separationRequests.filter(s => s.pgId === pg.id);
  const filteredSeps = pgSeps.filter(s => {
    if (search && !s.residentName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.requestDate.localeCompare(a.requestDate));

  const totalPages = Math.ceil(filteredSeps.length / pageSize);
  const paginatedSeps = filteredSeps.slice((page - 1) * pageSize, page * pageSize);

  const acting = separationRequests.find(s => s.id === actModal);

  const handleApprove = async () => {
    if (actModal && exitDate) {
      try {
        await approveSeparation(actModal, exitDate);
        setActModal(null);
        toast.success('Separation approved');
      } catch (error) {
        toast.error('Failed to approve separation.');
      }
    }
  };

  const handleReject = async () => {
    if (actModal) {
      try {
        await rejectSeparation(actModal);
        setActModal(null);
        toast.success('Separation rejected');
      } catch (error) {
        toast.error('Failed to reject separation.');
      }
    }
  };

  const statusVariant = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'destructive' : 'warning';

  return (
    <AdminLayout
      title="Separation Requests"
      subtitle={`${filteredSeps.length} request${filteredSeps.length !== 1 ? 's' : ''}`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'Separation Requests' },
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resident</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSeps.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No separation requests found</TableCell></TableRow>
              ) : (
                paginatedSeps.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.residentName}</TableCell>
                    <TableCell>{s.requestDate}</TableCell>
                    <TableCell>{s.exitDate}</TableCell>
                    <TableCell>{s.floorName}</TableCell>
                    <TableCell>Room {s.roomName}</TableCell>
                    <TableCell className="capitalize">{s.initiatedBy}</TableCell>
                    <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                    <TableCell>
                      {s.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => {
                          setActModal(s.id);
                          setExitDate(s.exitDate);
                        }}>Act</Button>
                      )}
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
          {/* Add bulk actions here if needed later */}
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

      {/* Act Modal */}
      <Dialog open={!!actModal} onOpenChange={() => setActModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Review Separation Request</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="glass-card rounded-lg p-4 space-y-2">
                <p><span className="text-sm text-muted-foreground">Resident:</span> <span className="font-medium">{acting.residentName}</span></p>
                <p><span className="text-sm text-muted-foreground">Location:</span> Room {acting.roomName}, {acting.floorName}</p>
                <p><span className="text-sm text-muted-foreground">Requested:</span> {acting.requestDate}</p>
                <p><span className="text-sm text-muted-foreground">Initiated by:</span> <span className="capitalize">{acting.initiatedBy}</span></p>
              </div>
              <div>
                <Label>Exit Date</Label>
                <Input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated as 1 month from request. You can edit this.</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={handleApprove}>Approve</Button>
                <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10" onClick={handleReject}>Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SeparationRequests;
