import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, Calendar, CreditCard, Download, Building2, LogOut, AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getResidentById, getPaymentsForResident, getFloorById, getRoomById, logout, reportGrievance, requestSeparation, separationRequests, withdrawSeparation } = useApp();

  if (!currentUser || currentUser.type !== 'resident' || !currentUser.residentId) {
    navigate('/login?type=resident');
    return null;
  }

  const resident = getResidentById(currentUser.residentId);
  if (!resident) { navigate('/login?type=resident'); return null; }

  const payments = getPaymentsForResident(resident.id);
  const floor = getFloorById(resident.floorId);
  const room = getRoomById(resident.roomId);
  const existingSepReq = separationRequests.find(s => s.residentId === resident.id && s.status !== 'rejected');

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueDesc, setIssueDesc] = useState('');

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    reportGrievance({
      residentId: resident.id,
      residentName: resident.name,
      description: issueDesc,
      photos: [],
      roomName: room?.name || '',
      floorName: floor?.name || '',
      pgId: resident.pgId,
    });
    setIssueDesc('');
    setIssueOpen(false);
    toast.success('Issue reported successfully');
  };

  const handleSeparation = () => {
    requestSeparation(resident.id, resident.pgId, 'resident');
    toast.success('Separation request submitted. Awaiting admin approval.');
  };

  const handleWithdraw = () => {
    if (existingSepReq) {
      withdrawSeparation(existingSepReq.id);
      toast.success('Separation request withdrawn');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const statusVariant = (s: string) => s === 'paid' ? 'success' : s === 'partially_paid' ? 'warning' : 'destructive';

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            <span className="text-lg font-display font-bold text-foreground">NestManager</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <User className="h-12 w-12 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">{resident.name}</h1>
                  <p className="text-muted-foreground">{resident.customId} · {floor?.name} · Room {room?.name}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={resident.status === 'monthly' ? 'success' : resident.status === 'daily' ? 'info' : 'warning'}>
                    {resident.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">{resident.gender}</Badge>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{resident.email}</div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{resident.phone}</div>
                <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-muted-foreground" />{resident.occupation}</div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {resident.joinedDate}</div>
              </div>
            </div>
          </div>

          {resident.exitDate && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm font-medium text-warning">📅 Exit Date: {resident.exitDate}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Report Issue</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Report an Issue</DialogTitle></DialogHeader>
                <form onSubmit={handleReportIssue} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Room:</span> {room?.name}</div>
                    <div><span className="text-muted-foreground">Floor:</span> {floor?.name}</div>
                  </div>
                  <div><Label>Issue Description</Label><Textarea placeholder="Describe your issue in detail..." value={issueDesc} onChange={e => setIssueDesc(e.target.value)} required rows={4} /></div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Submit Report</Button>
                </form>
              </DialogContent>
            </Dialog>

            {!existingSepReq ? (
              <Button variant="outline" className="text-destructive" onClick={handleSeparation}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Apply for Separation
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant={existingSepReq.status === 'approved' ? 'success' : 'warning'}>
                  Separation: {existingSepReq.status}
                </Badge>
                {existingSepReq.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={handleWithdraw}>Withdraw</Button>
                )}
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default ResidentDashboard;
