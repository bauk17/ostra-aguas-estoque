import { Search, Bell, Settings } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="Pesquisar pedidos, clientes, ou estoque..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-blue-50 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-blue-50 rounded-full transition-colors">
          <Settings size={20} />
        </button>
        
        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
          <img
            alt="Admin"
            className="w-full h-full object-cover"
            src="https://avatar.vercel.sh/ostra" // Exemplo de placeholder
          />
        </div>
      </div>
    </header>
  );
};