import { LayoutDashboard, Package, Users, ShoppingCart, PlusCircle, HelpCircle, LogOut } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-50 border-r border-slate-200 w-64 z-50">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold text-blue-900 font-headline">Ostra Águas</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Logística</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <NavItem icon={<Package size={20} />} label="Cargas" />
        <NavItem icon={<Users size={20} />} label="Clientes" />
        <NavItem icon={<ShoppingCart size={20} />} label="Pedidos" />
      </nav>

      <div className="px-4 mb-6">
        <button className="w-full bg-gradient-to-r from-secondary to-primary text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg">
          <PlusCircle size={20} />
          <span>New Delivery</span>
        </button>
      </div>
      
      <div className="border-t border-slate-200 pt-4">
        <NavItem icon={<HelpCircle size={20} />} label="Support" />
        <NavItem icon={<LogOut size={20} />} label="Sign Out" className="text-red-500" />
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false, className = "" }: any) => (
  <a className={`mx-2 p-3 flex items-center gap-3 rounded-lg transition-all ${
    active ? 'bg-blue-600 text-white shadow-md' : `text-slate-600 hover:bg-white ${className}`
  }`} href="#">
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);