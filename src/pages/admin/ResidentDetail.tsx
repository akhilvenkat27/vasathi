import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, CreditCard, Calendar, Download, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const ResidentDetail = () => {
  const { pgId, residentId } = useParams<{ pgId: string; residentId: string }>();
  const { getPGById, getResidentById, getPaymentsForResident, getFloorById, getRoomById, addPayment, requestSeparation, separationRequests, withdrawSeparation } = useApp();
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ period: '', type: 'rent' as 'rent' | 'advance' | 'deposit' | 'other', status: 'paid' as 'paid' | 'partially_paid' | 'unpaid', amount: 0, date: new Date().toISOString().split('T')[0] });

  const pg = getPGById(pgId || '');
  const resident = getResidentById(residentId || '');

  if (!pg || !resident) return <div className="p-8 text-center">Not found</div>;

  const payments = getPaymentsForResident(resident.id);
  const floor = getFloorById(resident.floorId);
  const room = getRoomById(resident.roomId);
  const existingSepReq = separationRequests.find(s => s.residentId === resident.id && s.status !== 'rejected');

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment({ ...payForm, residentId: resident.id });
    setPayForm({ period: '', type: 'rent', status: 'paid', amount: 0, date: new Date().toISOString().split('T')[0] });
    setPayOpen(false);
    toast.success('Payment added!');
  };

  const handleSeparation = () => {
    requestSeparation(resident.id, pg.id, 'admin');
    toast.success('Separation request raised');
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
                <div><Label>Period</Label><Input placeholder="e.g. Mar 2025" value={payForm.period} onChange={e => setPayForm(p => ({ ...p, period: e.target.value }))} required /></div>
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
            <Button variant="outline" className="text-destructive" onClick={handleSeparation}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Raise Separation
            </Button>
          )}
        </div>
      }
    >
      {/* Profile Info */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <User className="h-10 w-10 text-accent" />
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
      <h2 className="text-xl font-display font-bold text-foreground mb-4">Payment History</h2>
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
            {payments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>
            ) : (
              payments.sort((a, b) => b.date.localeCompare(a.date)).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.period}</TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariant(p.status)}>{p.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default ResidentDetail;
