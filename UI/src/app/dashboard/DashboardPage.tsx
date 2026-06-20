import { useState, useEffect } from 'react';
import { Sidebar } from "../../components/layout/Sidebar";
import { Loader2, CircleDollarSign, TrendingUp, CalendarArrowUp, UserRound, ArrowRight } from 'lucide-react';
import { listarPedidos } from '../../features/pedidos/repository';

interface PedidoRecente {
  id: string;
  cliente: string; // Nome obtido via INNER JOIN no banco
  produto: string;
  quantidade: number;
  valor_total: number | string; // Permitindo string caso venha formatado do banco
  status: 'Pendente' | 'Em Rota' | 'Entregue' | string;
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<PedidoRecente[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para os Cards de Métricas
  const [metricas] = useState({
    vendasMes: 42850.00,
    entregasAtivas: 18,
    novosClientes: 24
  });

  useEffect(() => {
    const buscarDadosDashboard = async () => {
      setLoading(true);
      try {
        const todosPedidos = await listarPedidos() as PedidoRecente[];
        setPedidos(todosPedidos);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDashboard();
  }, []);

  // --- LÓGICA DE LIMITAÇÃO ---
  // Pega apenas os 5 primeiros pedidos retornados do repositório
  const pedidosRecentes = pedidos.slice(0, 5);

  return (
    <div className="min-h-screen bg-background font-body-md antialiased text-on-background">
      <Sidebar />
      
      <main className="min-h-screen bg-[#f9f9f9]">
        
        {/* Dashboard Canvas Container */}
        <div className="p-8 space-y-8">
          
          {/* Welcome Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-headline-lg text-3xl font-bold text-primary">Gerenciamento de Pedidos</h2>
              <p className="text-body-md text-slate-500">Visão geral das operações de hoje.</p>
            </div>
          </div>

          {/* Stat Cards: Bento Grid Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Sales Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined"><CircleDollarSign /></span>
                </div>
                <span className="text-emerald-500 flex items-center text-sm font-bold gap-0.5">
                  <span className="material-symbols-outlined text-sm"><TrendingUp /></span> +12%
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Vendas Totais (Mês)</p>
              <h3 className="font-headline-md text-2xl font-bold text-primary mt-1">
                {metricas.vendasMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>

            {/* Active Deliveries Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined"><CalendarArrowUp /></span>
                </div>
                <span className="text-secondary text-xs font-bold bg-blue-50/50 px-2 py-1 rounded-md">
                  Ativo Agora
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Entregas Ativas</p>
              <h3 className="font-headline-md text-2xl font-bold text-primary mt-1">{metricas.entregasAtivas} Pedidos</h3>
            </div>

            {/* New Customers Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined"><UserRound /></span>
                </div>
                <span className="text-emerald-500 flex items-center text-sm font-bold gap-0.5">
                  <span className="material-symbols-outlined text-sm"><TrendingUp /></span> +8%
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Novos Clientes</p>
              <h3 className="font-headline-md text-2xl font-bold text-primary mt-1">{metricas.novosClientes} Novos</h3>
            </div>

          </div>

          {/* Recent Orders Table Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-headline-sm text-lg font-bold text-primary">Pedidos Recentes</h4>
                <p className="text-sm text-slate-500">Últimas 5 transações sincronizadas com o banco local</p>
              </div>
              <button className="text-secondary text-sm font-bold flex items-center gap-1 hover:underline">
                Visualizar todos <span className="material-symbols-outlined text-sm"><ArrowRight /></span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4">ID Pedido</th>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4">Produto</th>
                    <th className="px-8 py-4">Valor</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-secondary" size={18} />
                          <span className="text-sm font-medium">Buscando transações recentes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pedidosRecentes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-400 font-medium">
                        Nenhum pedido registrado hoje.
                      </td>
                    </tr>
                  ) : (
                    // Mapeando a lista cortada de apenas 5 itens
                    pedidosRecentes.map((pedido) => {
                      // Garante que o valor total seja tratado como número para a formatação
                      const valorNumerico = typeof pedido.valor_total === 'string' 
                        ? parseFloat(pedido.valor_total.replace(/[^\d,.-]/g, '').replace(',', '.')) 
                        : pedido.valor_total;

                      return (
                        <tr key={pedido.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-4 font-mono text-xs text-slate-600">
                            #OA-{pedido.id.substring(0, 4).toUpperCase()}
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-slate-700">{pedido.cliente}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm text-slate-600">
                            {pedido.quantidade}x {pedido.produto ? pedido.produto.split(' - ')[0] : ''}
                          </td>
                          <td className="px-8 py-4 font-bold text-primary text-sm">
                            {isNaN(valorNumerico) ? pedido.valor_total : valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="px-8 py-4">
                            {pedido.status === 'Pendente' && (
                              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Pendente
                              </span>
                            )}
                            {pedido.status === 'Em Rota' && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Em Rota
                              </span>
                            )}
                            {pedido.status === 'Entregue' && (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Entregue
                              </span>
                            )}
                            {pedido.status !== 'Pendente' && pedido.status !== 'Em Rota' && pedido.status !== 'Entregue' && (
                              <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> {pedido.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}