import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/contexts/AppContext';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DuesReport = () => {
    const { pgId } = useParams<{ pgId: string }>();
    const { getPGById, getResidentsForPG, payments, floors, rooms, getFloorById, getRoomById } = useApp();

    const pg = getPGById(pgId || '');
    const allResidents = getResidentsForPG(pg?.id || '');

    const now = new Date();
    const [month, setMonth] = useState(MONTHS[now.getMonth()]);
    const [year, setYear] = useState(String(now.getFullYear()));
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const pageSize = 15;

    const period = `${month} ${year}`;

    const reportData = useMemo(() => {
        return allResidents.map(r => {
            const floorName = getFloorById(r.floorId)?.name || '';
            const roomName = getRoomById(r.roomId)?.name || '';
            const room = getRoomById(r.roomId);
            const rent = room?.rent || 0;
            const residentPayments = payments.filter(
                p => p.residentId === r.id && p.period === period && p.type === 'rent'
            );
            const totalPaid = residentPayments.reduce((sum, p) => sum + (p.status === 'paid' || p.status === 'partially_paid' ? p.amount : 0), 0);
            const latestStatus = residentPayments.length > 0
                ? residentPayments.sort((a, b) => b.date.localeCompare(a.date))[0].status
                : 'unpaid';

            return {
                ...r,
                floorName,
                roomName,
                rent,
                totalPaid,
                due: Math.max(0, rent - totalPaid),
                paymentStatus: latestStatus as 'paid' | 'partially_paid' | 'unpaid',
            };
        });
    }, [allResidents, payments, period, getFloorById, getRoomById]);

    const filtered = useMemo(() => {
        return reportData.filter(r => {
            if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.customId.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterStatus !== 'all' && r.paymentStatus !== filterStatus) return false;
            return true;
        });
    }, [reportData, search, filterStatus]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Summary stats
    const totalRent = reportData.reduce((s, r) => s + r.rent, 0);
    const totalCollected = reportData.reduce((s, r) => s + r.totalPaid, 0);
    const totalDue = reportData.reduce((s, r) => s + r.due, 0);
    const paidCount = reportData.filter(r => r.paymentStatus === 'paid').length;
    const partialCount = reportData.filter(r => r.paymentStatus === 'partially_paid').length;
    const unpaidCount = reportData.filter(r => r.paymentStatus === 'unpaid').length;

    const statusBadge = (s: string) => {
        switch (s) {
            case 'paid': return <Badge variant="success">Paid</Badge>;
            case 'partially_paid': return <Badge variant="warning">Partial</Badge>;
            default: return <Badge variant="destructive">Unpaid</Badge>;
        }
    };

    const exportCSV = (dataToExport: typeof reportData, filename: string) => {
        const headers = ['Custom ID', 'Name', 'Floor', 'Room', 'Rent (₹)', 'Paid (₹)', 'Due (₹)', 'Status'];
        const rows = dataToExport.map(r => [
            r.customId, r.name, r.floorName, `Room ${r.roomName}`,
            String(r.rent), String(r.totalPaid), String(r.due), r.paymentStatus.replace('_', ' ')
        ]);
        const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${dataToExport.length} records`);
    };

    if (!pg) return <div className="p-8 text-center">PG not found</div>;

    return (
        <AdminLayout
            title="Monthly Dues Report"
            subtitle={`${pg.name} · ${period}`}
            breadcrumbs={[
                { label: pg.name, path: `/admin/${pg.id}` },
                { label: 'Dues Report' },
            ]}
            actions={
                <Button variant="outline" className="font-bold" onClick={() => exportCSV(filtered, `dues_${period.replace(' ', '_')}.csv`)}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
            }
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-foreground">₹{totalRent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Total Rent</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-green-600">₹{totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Collected</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-red-600">₹{totalDue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Pending</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-green-600">{paidCount}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Paid</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-yellow-600">{partialCount}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Partial</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-red-600">{unpaidCount}</p>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Unpaid</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <Label className="text-xs font-bold mb-1 block">Month</Label>
                    <Select value={month} onValueChange={v => { setMonth(v); setPage(1); }}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs font-bold mb-1 block">Year</Label>
                    <Select value={year} onValueChange={v => { setYear(v); setPage(1); }}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => String(now.getFullYear() - 2 + i)).map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <Label className="text-xs font-bold mb-1 block">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Name or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                    </div>
                </div>
                <div>
                    <Label className="text-xs font-bold mb-1 block">Status</Label>
                    <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partially_paid">Partial</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80">
                            <TableHead>Resident</TableHead>
                            <TableHead>Floor</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead className="text-right">Rent (₹)</TableHead>
                            <TableHead className="text-right">Paid (₹)</TableHead>
                            <TableHead className="text-right">Due (₹)</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No residents found</TableCell></TableRow>
                        ) : (
                            paginated.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        <p className="font-medium">{r.name}</p>
                                        <p className="text-xs text-muted-foreground">{r.customId}</p>
                                    </TableCell>
                                    <TableCell>{r.floorName}</TableCell>
                                    <TableCell>Room {r.roomName}</TableCell>
                                    <TableCell className="text-right font-medium">₹{r.rent.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">₹{r.totalPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-red-600">{r.due > 0 ? `₹${r.due.toLocaleString()}` : '–'}</TableCell>
                                    <TableCell>{statusBadge(r.paymentStatus)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">{filtered.length} residents</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium">{page} / {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default DuesReport;
