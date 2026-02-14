import { useNavigate, useParams, Link } from 'react-router-dom';
import { Building2, ChevronRight, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ReactNode } from 'react';

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
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            <span className="text-lg font-display font-bold text-foreground">NestManager</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <Home className="h-4 w-4 mr-1" /> Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="bg-card/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
              <Link to="/admin" className="hover:text-foreground transition-colors whitespace-nowrap">Home</Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-foreground transition-colors whitespace-nowrap">{crumb.label}</Link>
                  ) : (
                    <span className="text-foreground font-medium whitespace-nowrap">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
