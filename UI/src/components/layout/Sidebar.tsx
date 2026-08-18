import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, NotebookText, Download, RefreshCw } from 'lucide-react';
import { useUpdateCheck } from '../../hooks/useUpdateCheck';

export const Sidebar = () => {
  const { isChecking, progress, statusText, checkForUpdates } = useUpdateCheck();

  const buttonLabel = isChecking
    ? progress > 0
      ? `Atualizando ${Math.round(progress)}%`
      : 'Verificando...'
    : 'Atualizar';

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-50 border-r border-slate-200 w-64 z-50">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold text-blue-900 font-headline">Ostra Águas</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Logística</p>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/cargas" icon={<Package size={20} />} label="Cargas" />
        <NavItem to="/clientes" icon={<Users size={20} />} label="Clientes" />
        <NavItem to="/pedidos" icon={<ShoppingCart size={20} />} label="Pedidos" />
        <NavItem to="/movimentacoes" icon={<NotebookText size={20} />} label="Relatório" />
        <NavItem to="/backups" icon={<NotebookText size={20} />} label="Backups" />
      </nav>

      <div className="border-t border-slate-200 pt-4 px-2">
        <button
          type="button"
          onClick={() => checkForUpdates(false)}
          disabled={isChecking}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-400 hover:bg-blue-700 transition-colors"
        >
          {isChecking ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          <span>{buttonLabel}</span>
        </button>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            <span>Progresso</span>
            <span>{isChecking ? `${Math.round(progress)}%` : 'Pronto'}</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isChecking ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-300'}`}
              style={{ width: `${isChecking ? progress : 0}%` }}
            />
          </div>

          <p className="min-h-[16px] text-[11px] text-slate-600">{statusText}</p>
        </div>
      </div>
    </aside>
  );
};

// Componente de Item de Navegação adaptado para React Router
const NavItem = ({ icon, label, to, className = "" }: any) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      mx-2 p-3 flex items-center gap-3 rounded-lg transition-all 
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
        : `text-slate-600 hover:bg-white hover:translate-x-1 ${className}`
      }
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </NavLink>
);