import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastContainer } from "@/components/ui/Toast";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const sidebarExpanded = useUIStore((state) => state.sidebarExpanded);

  useUIStore.getState().setActivePage(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-200",
            sidebarExpanded ? "lg:ml-0" : ""
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
