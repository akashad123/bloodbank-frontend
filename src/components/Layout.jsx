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
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-[52px] px-4 bg-[#111111] border-b-4 border-[#CD0000]">
          <button
            id="sidebar-hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="text-white hover:text-[#CD0000] transition-colors p-1"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-black text-base tracking-tight">
            RED<span style={{ color: '#CD0000' }}>CONNECT</span>
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
