import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, CreditCard, Calendar, Download, Plus, AlertTriangle, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const ResidentDetail = () => {
  const { pgId, residentId } = useParams<{ pgId: string; residentId: string }>();
  const { getPGById, getResidentById, getPaymentsForResident, getFloorById, getRoomById, addPayment, requestSeparation, separationRequests, withdrawSeparation } = useApp();
  const [payOpen, setPayOpen] = useState(false);
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [payForm, setPayForm] = useState({
    month: new Date().toLocaleString('default', { month: 'short' }),
    year: new Date().getFullYear().toString(),
    type: 'rent' as 'rent' | 'advance' | 'deposit' | 'other',
    status: 'paid' as 'paid' | 'partially_paid' | 'unpaid',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const pg = getPGById(pgId || '');
  const resident = getResidentById(residentId || '');

  if (!pg || !resident) return <div className="p-8 text-center">Not found</div>;

  const payments = getPaymentsForResident(resident.id);
  const floor = getFloorById(resident.floorId);
  const room = getRoomById(resident.roomId);
  const existingSepReq = separationRequests.find(s => s.residentId === resident.id && s.status !== 'rejected');

  const filteredPayments = payments.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPayment({
        period: `${payForm.month} ${payForm.year}`,
        type: payForm.type,
        status: payForm.status,
        amount: payForm.amount,
        date: payForm.date,
        residentId: resident.id
      });
      setPayForm({
        month: new Date().toLocaleString('default', { month: 'short' }),
        year: new Date().getFullYear().toString(),
        type: 'rent',
        status: 'paid',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
      setPayOpen(false);
      toast.success('Payment added!');
    } catch (error) {
      toast.error('Failed to add payment. Please try again.');
    }
  };

  const handleDownloadReceipt = (payment: any) => {
    const content = `VASATHI RESIDENCE RECEIPT\n\nDate: ${payment.date}\nResident: ${resident.name}\nAmount: ₹${payment.amount}\nPeriod: ${payment.period}\nType: ${payment.type}\nStatus: ${payment.status}\n\nExperience Seamless Living with Vasathi`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${payment.period.replace(' ', '_')}_${payment.type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  const handleSeparation = async () => {
    try {
      await requestSeparation(resident.id, pg.id, 'admin');
      toast.success('Separation request raised');
    } catch (error) {
      toast.error('Failed to raise separation request.');
    }
  };

  const statusVariant = (s: string) => s === 'paid' ? 'success' : s === 'partially_paid' ? 'warning' : 'destructive';

  return (
    <AdminLayout
      title={resident.name}
      subtitle={`${resident.customId} · ${floor?.name} · Room ${room?.name}`}
      breadcrumbs={[
        { label: pg.name, path: `/admin/${pg.id}` },
        { label: 'All Residents', path: `/admin/${pg.id}/residents` },
        { label: resident.name },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Dialog open={payOpen} onOpenChange={setPayOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" /> Add Payment</Button>
            </DialogTrigger>
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
                  <Select value={payForm.type} onValueChange={v => setPayForm(p => ({ ...p, type: v as any }))}>
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
                  <Select value={payForm.status} onValueChange={v => setPayForm(p => ({ ...p, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partially_paid">Partially Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (₹)</Label><Input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: Number(e.target.value) }))} required /></div>
                <div><Label>Date</Label><Input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))} required /></div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add Payment</Button>
              </form>
            </DialogContent>
          </Dialog>
          {!existingSepReq && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Raise Separation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Raise Separation Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will initiate a comprehensive separation request for {resident.name}.
                    Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeparation}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      }
    >
      {/* Profile Info */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white shadow-md border-4 border-white">
            <img
              src={resident.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${resident.name}`}
              className="w-full h-full object-cover"
              alt={resident.name}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 flex-1">
            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{resident.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{resident.phone}</span></div>
            <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{resident.occupation}</span></div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Joined {resident.joinedDate}</span></div>
            <div className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>Aadhar: {resident.aadharNumber}</span></div>
            <div className="flex items-center gap-2">
              <Badge variant={resident.status === 'monthly' ? 'success' : resident.status === 'daily' ? 'info' : 'warning'}>
                {resident.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">{resident.gender}</Badge>
            </div>
          </div>
        </div>
        {resident.exitDate && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm font-medium text-warning">Exit Date: {resident.exitDate}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-foreground">Payment History</h2>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partially_paid">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow>
            ) : (
              paginatedPayments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.period}</TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariant(p.status)}>{p.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(p)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages || 1}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ResidentDetail;
