import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { sidebarItems } from '../../data/app-data';
import { getIcon } from '../../lib/icons';

type SidebarProps = {
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
};

export function Sidebar({ mobileOpen, onToggleMobile, onCloseMobile }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleMobile}
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow md:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`fixed inset-0 z-30 bg-slate-900/30 md:hidden ${mobileOpen ? 'block' : 'hidden'}`} onClick={onCloseMobile} />

      <aside
        className={[
          'fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-950',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-6 mt-10 md:mt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">Learning Hub</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">Offline Student PWA</h1>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-teal-100 text-teal-900 dark:bg-teal-900/40 dark:text-teal-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Install this app on mobile to study offline and continue where you left off.
        </div>
      </aside>
    </>
  );
}