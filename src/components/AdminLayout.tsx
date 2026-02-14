import { useNavigate, useParams, Link } from 'react-router-dom';
import { Building2, ChevronRight, LogOut, Home, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';

interface Crumb { label: string; path?: string; }

interface AdminLayoutProps {
  children: ReactNode;
  breadcrumbs?: Crumb[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const AdminLayout = ({ children, breadcrumbs = [], title, subtitle, actions }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout, isLoading } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="group">
              <span className="text-2xl font-black tracking-tight transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>
                <span className="text-accent">Vasa</span>
                <span style={{ color: '#7d9fad' }}>thi.</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search property, tenant or rooms..." className="pl-10 h-10 bg-slate-100/50 border-0 focus-visible:ring-accent rounded-full text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="font-semibold text-sm">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold text-sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground overflow-x-auto">
              <Link to="/admin" className="hover:text-accent transition-colors whitespace-nowrap">Home</Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-40" />
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-accent transition-colors whitespace-nowrap">{crumb.label}</Link>
                  ) : (
                    <span className="text-foreground whitespace-nowrap">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-lg text-muted-foreground font-medium mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-slate-100 border-t-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent/40" />
              </div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-6 animate-pulse">Syncing Vasathi Cloud</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
