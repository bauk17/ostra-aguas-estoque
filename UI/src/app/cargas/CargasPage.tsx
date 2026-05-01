import { 
  PlusSquare, 
  Droplets, 
  Leaf, 
  Truck, 
  CircleDollarSign, 
  Filter, 
  CheckCircle2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Waves,
  BarChart3
} from 'lucide-react';

export default function CargasPage() {
  return (
    <div className="p-8 space-y-6 font-manrope">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Controle de Cargas</h2>
          <p className="text-sm text-slate-500">Gerencie o estoque de garrafões cheios e retornáveis.</p>
        </div>
        <button className="bg-linear-to-r from-[#00658d] to-[#001e40] text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:opacity-90">
          <PlusSquare size={20} />
          Add Stock
        </button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Full Units" 
          value="1,482" 
          icon={<Droplets className="text-blue-600" />} 
          badge="+12%" 
          badgeColor="bg-green-50 text-green-600"
          iconBg="bg-blue-50"
        />
        <StatCard 
          title="Empty Returns" 
          value="324" 
          icon={<Leaf className="text-orange-600" />} 
          badge="Low Stock" 
          badgeColor="bg-orange-50 text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatCard 
          title="In Transit" 
          value="85" 
          icon={<Truck className="text-purple-600" />} 
          iconBg="bg-purple-50"
        />
        <StatCard 
          title="Asset Value" 
          value="R$ 24.5k" 
          icon={<CircleDollarSign className="text-cyan-600" />} 
          iconBg="bg-cyan-50"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <FilterSelect icon={<Filter size={16}/>} label="All Categories" />
            <FilterSelect icon={<CheckCircle2 size={16}/>} label="All Status" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Showing 8 products
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock (Full)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock (Empty)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <ProductRow 
                name="20L Gallon - Premium" 
                type="Retornável" 
                sku="OA-20L-PR" 
                full="842" 
                empty="156" 
                price="R$ 18,90" 
                status="In Stock"
              />
              <ProductRow 
                name="10L Bottle - Family" 
                type="Descartável" 
                sku="OA-10L-FM" 
                full="45" 
                empty="—" 
                price="R$ 12,50" 
                status="Low Stock"
              />
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
          <button className="text-sm font-bold text-slate-400 hover:text-[#00658d] flex items-center gap-1">
            <ChevronLeft size={16}/> Previous
          </button>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-[#00658d] text-white text-sm font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 text-sm font-semibold">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 text-sm font-semibold">3</button>
          </div>
          <button className="text-sm font-bold text-slate-600 hover:text-[#00658d] flex items-center gap-1">
            Next <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* Contextual Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-[#001e40] to-[#003366] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Refill Reminder</h3>
            <p className="text-blue-100/80 mb-6 max-w-sm">3 products are currently below their safety stock margin. Schedule a pickup for empty containers.</p>
            <button className="bg-white text-[#001e40] font-bold px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
              Manage Empty Returns
            </button>
          </div>
          <Waves className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700 w-40 h-40" />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-[#00658d]" size={20} />
            <h3 className="font-bold text-[#001e40]">Stock Turnover (7 Days)</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 55, 80, 95, 30, 20].map((h, i) => (
              <div 
                key={i} 
                style={{ height: `${h}%` }} 
                className={`flex-1 rounded-t-lg transition-all hover:opacity-80 ${i === 4 ? 'bg-[#00658d]' : 'bg-blue-100'}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sub-componentes para limpeza de código */

function StatCard({ title, value, icon, badge, badgeColor, iconBg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className={`p-2 ${iconBg} rounded-lg`}>{icon}</span>
        {badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>}
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-[#001e40] mt-1">{value}</p>
      </div>
    </div>
  );
}

function ProductRow({ name, type, sku, full, empty, price, status }: any) {
  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#00658d]">
            <Droplets size={18} />
          </div>
          <div>
            <p className="font-bold text-[#001e40]">{name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-sm text-slate-500">{sku}</td>
      <td className="px-6 py-4 font-bold text-[#001e40]">{full}</td>
      <td className="px-6 py-4 text-slate-500 font-semibold">{empty}</td>
      <td className="px-6 py-4 font-bold text-slate-700">{price}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
          status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'In Stock' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#00658d] transition-all">
          <Edit3 size={18} />
        </button>
      </td>
    </tr>
  );
}

function FilterSelect({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
      <span className="text-slate-400">{icon}</span>
      <select className="border-none text-xs font-bold focus:ring-0 bg-transparent text-slate-600 cursor-pointer outline-none">
        <option>{label}</option>
      </select>
    </div>
  );
}