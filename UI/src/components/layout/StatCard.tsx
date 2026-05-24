interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: string;
  stockDetails?: boolean; // Para habilitar a barra de Full/Empty
}

export const StatCard = ({ title, value, unit, icon, trend, stockDetails }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
      {/* Detalhe visual de fundo */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {value} {unit && <span className="text-sm text-slate-400 font-normal">{unit}</span>}
            </h3>
          </div>
          {icon && (
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
            <span>{trend}</span>
          </div>
        )}

        {stockDetails && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">Cheios</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%]"></div>
              </div>
              <p className="text-xs font-bold text-blue-600 mt-1">840</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">Vazios</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-[25%]"></div>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-1">408</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};