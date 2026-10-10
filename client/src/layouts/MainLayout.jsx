import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Bell, User, X, Settings } from 'lucide-react';
import clsx from 'clsx';
import OfflineBanner from '../components/OfflineBanner';
import Logo from '../components/Logo';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Morning Brief', path: '/reports' },
    { name: 'Data Sources', path: '/reports' },
    { name: 'Exceptions', path: '/reports' },
    { name: 'Reports', path: '/reports' },
    { name: 'Journey Planner', path: '/journey-planner' },
  ];

  return (
    <div className="min-h-screen flex font-inter bg-raahx-bg text-raahx-navy">
      <OfflineBanner />
      
      {/* Desktop Sidebar (Light Mode) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-raahx-border bg-white sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <Link to="/reports" className="block">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={clsx(
                "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === link.path || (location.pathname === '/' && link.path === '/')
                  ? "bg-orange-50 text-raahx-orange border-l-2 border-raahx-orange"
                  : "text-raahx-slate hover:text-raahx-navy hover:bg-gray-50 border-l-2 border-transparent"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-raahx-border">
          <Link to="/settings" className="flex items-center px-4 py-3 text-sm font-medium text-raahx-slate hover:text-raahx-navy hover:bg-gray-50 rounded-lg transition-colors">
            <Settings size={18} className="mr-3" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-white border-b border-raahx-border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <button 
            className="text-raahx-navy hover:text-raahx-orange transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] z-30 bg-white border-t border-raahx-border overflow-y-auto shadow-lg">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "p-4 rounded-lg text-base font-medium transition-colors",
                  location.pathname === link.path ? "bg-orange-50 text-raahx-orange" : "text-raahx-slate hover:text-raahx-navy hover:bg-gray-50"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Topbar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-raahx-border bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm font-medium text-raahx-slate bg-gray-50 px-4 py-2 rounded-full border border-raahx-border">
            <span className="w-2 h-2 rounded-full bg-raahx-orange"></span>
            Ahmedabad Metro
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="text-raahx-slate hover:text-raahx-navy transition-colors relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-raahx-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-raahx-orange"></span>
              </span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-raahx-border cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-gray-50 border border-raahx-border flex items-center justify-center group-hover:border-raahx-orange transition-colors shadow-sm">
                <User size={18} className="text-raahx-slate" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 pt-20 md:pt-8 md:p-8 animate-in fade-in duration-500 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
