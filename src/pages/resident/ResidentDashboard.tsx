import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/imageUrl';
import { User, Mail, Phone, Briefcase, Calendar, CreditCard, Download, Building2, LogOut, AlertTriangle, MessageSquare, ChevronLeft, ChevronRight, Image as ImageIcon, X, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getResidentById, getPaymentsForResident, getFloorById, getRoomById, logout, reportGrievance, requestSeparation, separationRequests, withdrawSeparation, isLoading, uploadMultipleImages } = useApp();
  const [isUploading, setIsUploading] = useState(false);

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
  const [issuePhotos, setIssuePhotos] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const urls = await uploadMultipleImages(files);
        setIssuePhotos(prev => [...prev, ...urls]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setIssuePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportGrievance({
        residentId: resident.id,
        residentName: resident.name,
        description: issueDesc,
        photos: issuePhotos,
        roomName: room?.name || '',
        floorName: floor?.name || '',
        pgId: resident.pgId,
      });
      setIssueDesc('');
      setIssuePhotos([]);
      setIssueOpen(false);
      toast.success('Our team has been notified. We will resolve this soon.');
    } catch (error) {
      toast.error('Failed to submit issue. Please try again.');
    }
  };

  const handleSeparation = async () => {
    try {
      await requestSeparation(resident.id, resident.pgId, 'resident');
      toast.success('Separation request submitted. Awaiting admin approval.');
    } catch (error) {
      toast.error('Failed to submit separation request.');
    }
  };

  const handleWithdraw = async () => {
    if (existingSepReq) {
      try {
        await withdrawSeparation(existingSepReq.id);
        toast.success('Separation request withdrawn');
      } catch (error) {
        toast.error('Failed to withdraw separation request.');
      }
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDownloadReceipt = (payment: any) => {
    const content = `VASATHI RESIDENCE RECEIPT\n\nDate: ${payment.date}\nResident: ${resident.name}\nAmount: ₹${payment.amount}\nPeriod: ${payment.period}\nType: ${payment.type}\nStatus: ${payment.status}\n\nExperience Seamless Living with Vasathi`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vasathi_receipt_${payment.period.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  const statusVariant = (s: string) => s === 'paid' ? 'success' : s === 'partially_paid' ? 'warning' : 'destructive';

  const sortedPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date));
  const totalPages = Math.ceil(sortedPayments.length / pageSize);
  const paginatedPayments = sortedPayments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="text-accent">Vasa</span>
              <span style={{ color: '#7d9fad' }}>thi.</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 hidden sm:block uppercase tracking-widest">Resident Portal</span>
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 mb-10 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="h-32 w-32" />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner ring-8 ring-slate-50">
                <img
                  src={resolveImageUrl(resident.profileImage) || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${resident.name}`}
                  className="w-full h-full object-cover"
                  alt={resident.name}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-xl p-1.5 shadow-lg border border-slate-100">
                <Badge variant="success" className="rounded-lg h-6 font-bold">{resident.status}</Badge>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-display font-black text-foreground mb-2">{resident.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400 font-bold text-sm">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" /> {floor?.name}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1.5">ROOM {room?.name}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-accent">{resident.customId}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <Badge variant="outline" className="h-8 px-4 rounded-xl border-2 font-bold uppercase tracking-widest text-[10px]">{resident.gender}</Badge>
                  <Button variant="outline" className="h-8 px-4 rounded-xl border-2 font-bold uppercase tracking-widest text-[10px]" onClick={() => navigate('/')}>Visit Home</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Email Address</p>
                    <p className="text-sm font-bold text-slate-600 truncate max-w-[180px]">{resident.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Phone className="h-4 w-4 text-slate-400 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Contact Number</p>
                    <p className="text-sm font-bold text-slate-600">{resident.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Briefcase className="h-4 w-4 text-slate-400 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Occupation</p>
                    <p className="text-sm font-bold text-slate-600">{resident.occupation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Calendar className="h-4 w-4 text-slate-400 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Joining Date</p>
                    <p className="text-sm font-bold text-slate-600">{resident.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {resident.exitDate && (
            <div className="mt-10 p-5 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-black text-orange-900 uppercase tracking-widest leading-none mb-1">Upcoming Departure</p>
                <p className="text-xs font-bold text-orange-700 opacity-70">Scheduled for {resident.exitDate}. We'll be sad to see you go.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-slate-100">
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-12 rounded-xl font-black"><MessageSquare className="h-4 w-4 mr-3" /> Report Issue</Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] border-0 shadow-2xl bg-white p-8">
                <DialogHeader><DialogTitle className="text-2xl font-black">Something Needs Fixing?</DialogTitle></DialogHeader>
                <form onSubmit={handleReportIssue} className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Room</p>
                      <p className="text-sm font-black text-slate-700">{room?.name}</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Floor</p>
                      <p className="text-sm font-black text-slate-700">{floor?.name}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Describe the problem</Label>
                    <Textarea placeholder="Tell us what's wrong and we'll fix it..." className="rounded-2xl resize-none mt-2 h-32 focus:ring-accent" value={issueDesc} onChange={e => setIssueDesc(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Photo Evidence</Label>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {issuePhotos.map((p, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                          <img src={resolveImageUrl(p)} alt="Issue" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-xl hover:bg-red-600 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <ImageIcon className={`h-6 w-6 text-slate-300 ${isUploading ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-black text-slate-400 mt-1">{isUploading ? '...' : 'ADD'}</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                      </label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 rounded-2xl font-black text-lg">Send Support Request</Button>
                </form>
              </DialogContent>
            </Dialog>

            {!existingSepReq ? (
              <Button variant="outline" className="h-12 border-2 px-8 rounded-xl font-black text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleSeparation}>
                Apply for Separation
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`px-5 h-12 rounded-xl border-2 font-black text-xs uppercase tracking-widest flex items-center ${existingSepReq.status === 'approved' ? 'border-green-100 bg-green-50 text-green-700' : 'border-orange-100 bg-orange-50 text-orange-700'}`}>
                  {existingSepReq.status === 'approved' ? '✓ Move-out Approved' : '⏳ Separation Pending'}
                </div>
                {existingSepReq.status === 'pending' && (
                  <Button size="sm" variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-50" onClick={handleWithdraw} title="Withdraw Request"><X className="h-5 w-5" /></Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-black text-foreground">Transaction Ledger</h2>
          <div className="px-3 py-1 bg-white rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Payments</div>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 pl-8">Billing Period</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Payment Type</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Amount</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</TableHead>
                <TableHead className="py-4 pr-8 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-300 font-bold italic">No payment history found</TableCell></TableRow>
              ) : (
                paginatedPayments.map(p => (
                  <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-5 pl-8 font-bold text-slate-700">{p.period}</TableCell>
                    <TableCell className="py-5"><Badge variant="outline" className="bg-white rounded-lg font-bold text-[10px] uppercase tracking-wider">{p.type}</Badge></TableCell>
                    <TableCell className="py-5 font-black text-slate-900">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell className="py-5"><Badge variant={statusVariant(p.status)} className="rounded-lg px-3 italic lowercase">{p.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="py-5 pr-8 text-right">
                      <Button variant="ghost" size="icon" className="group-hover:bg-accent group-hover:text-white rounded-xl transition-all" onClick={() => handleDownloadReceipt(p)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/30 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Show</span>
                <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-16 h-8 text-xs font-bold rounded-lg bg-white border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-2xl">
                    {[5, 10, 25, 50].map(n => <SelectItem key={n} value={String(n)} className="font-bold">{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Page {page} / {totalPages || 1}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-2 hover:bg-white" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-2 hover:bg-white" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-10 w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">© 2025 Vasathi Properties Pvt Ltd · Secure Resident Workspace</p>
      </footer>

      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-slate-100 border-t-accent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-accent/20" />
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-8 animate-pulse">Syncing Secure Data</p>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
