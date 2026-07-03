import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    /*
     * Root wrapper — relative so sidebar's fixed positioning anchors correctly.
     * min-h-screen ensures page fills viewport.
     */
    <div className="min-h-screen bg-bg">

      {/* Sidebar — fixed positioned, handles its own desktop/mobile visibility */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/*
       * Main content area.
       *
       * lg:ml-60  → offset by sidebar width (240px = 60 * 4px) on desktop.
       *             On mobile the sidebar is fixed/overlaid so no margin needed.
       *
       * flex flex-col min-h-screen → makes content fill full height.
       */}
      <div className="lg:ml-60 flex flex-col min-h-screen">

        {/* ── Mobile top bar — hidden on desktop ── */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-[56px] px-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <button
            id="sidebar-hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="text-text-secondary hover:text-primary transition-colors p-1"
          >
            <Menu size={22} />
          </button>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-text-primary font-black text-base tracking-tight">RED<span className="text-primary">CONNECT</span></span>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest border-l-2 border-primary/50 pl-1.5">DYFI MOKERI EAST</span>
          </span>
        </header>

        {/* ── Page outlet ── */}
        <main className="flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
