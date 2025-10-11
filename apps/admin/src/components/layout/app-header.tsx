import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks';

export function AppHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get the current page title from the pathname
  const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const page = segments[0] || 'dashboard';
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Welcome, {user?.firstName || user?.username || 'Admin'}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
