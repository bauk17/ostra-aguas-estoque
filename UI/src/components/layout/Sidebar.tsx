import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, PlusCircle, HelpCircle, LogOut } from 'lucide-react';

export const Sidebar = () => {
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
      </nav>

      
      
      <div className="border-t border-slate-200 pt-4">
        
        <button className="w-[calc(100%-16px)] mx-2 p-3 flex items-center gap-3 rounded-lg text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
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