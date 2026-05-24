import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Loader2, CircleDollarSign, TrendingUp, CalendarArrowUp, UserRound, Pencil, ArrowRight } from 'lucide-react';
// Supondo que você tenha a função no repositório de pedidos para listar com JOIN
import { listarPedidos } from '../../features/pedidos/repository';


interface PedidoRecente {
  id: string;
  cliente: string; // Nome obtido via INNER JOIN no banco
  produto: string;
  quantidade: number;
  valor_total: number;
  status: 'Pendente' | 'Em Rota' | 'Entregue' | string;
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<PedidoRecente[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para os Cards de Métricas (podem ser buscados dinamicamente no futuro)
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
        console.error("Erro ao carregar dados do dashboard:");
        console.log(todosPedidos);
        setPedidos(todosPedidos);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDashboard();
  }, []);

  // Função auxiliar para gerar a sigla/avatar do cliente
  const obterIniciais = (nome: string) => {
    if (!nome) return '??';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  // Retorna a cor do avatar baseado no nome para dar variedade visual
  const obterCorAvatar = (nome: string) => {
    const cores = [
      'bg-blue-100 text-blue-600',
      'bg-slate-100 text-slate-600',
      'bg-indigo-100 text-indigo-600',
      'bg-cyan-100 text-cyan-600'
    ];
    const index = nome ? nome.length % cores.length : 0;
    return cores[index];
  };

  return (
    <div className="min-h-screen bg-background font-body-md antialiased text-on-background">
      <Sidebar />
      
      <main className="ml-72 min-h-screen bg-[#f9f9f9]">
        
        
        {/* Dashboard Canvas Container */}
        <div className="p-8 space-y-8">
          
          {/* Welcome Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-headline-lg text-3xl font-bold text-primary">Gerenciamento de Pedidos</h2>
              <p className="text-body-md text-slate-500">Visão geral das operações de hoje.</p>
            </div>
            <div className="flex gap-3">
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
                <p className="text-sm text-slate-500">Últimas transações sincronizadas com o banco local</p>
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
                    <th className="px-8 py-4">Ação</th>
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
                  ) : pedidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-400 font-medium">
                        Nenhum pedido registrado hoje.
                      </td>
                    </tr>
                  ) : (
                    pedidos.map((pedido) => (
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
                          {pedido.quantidade}x {pedido.produto.split(' - ')[0]}
                        </td>
                        <td className="px-8 py-4 font-bold text-primary text-sm">
                          {pedido.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                        <td className="px-8 py-4">
                          <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-xl">
                            <Pencil/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Atmospheric Liquid Background Glow */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
        <div className="w-[600px] h-[600px] bg-gradient-to-br from-[#2dbcfe] to-[#00658d] rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}