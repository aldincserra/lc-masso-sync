import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="container py-6 max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
