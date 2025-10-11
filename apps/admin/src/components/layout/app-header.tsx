import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'react-router-dom';

export function AppHeader() {
  const location = useLocation();

  // Get the current page title from the pathname
  const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const page = segments[0] || 'dashboard';
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
    </header>
  );
}
