import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { StatCard } from "../../components/layout/StatCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 bg-">
        <Header />
        
        <div className="">
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Estoque Total" value="1,248" unit="unidades" />
            {/* ... outros cards */}
          </div>

          {/* Seção do Meio (Gráfico e Ações) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 h-80">
               <h4 className="font-bold text-primary">Volume Diário de Entregas</h4>
               {/* Aqui você integrará uma lib como Recharts futuramente */}
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-100">
               <h4 className="font-bold text-primary mb-4">Ações Rápidas</h4>
               {/* Botões de ação rápida */}
            </div>
          </div>

          
        </div>
      </main>
    </div>
  );
}