import React, { useState, useEffect } from 'react';
import { 
  Search, ReceiptText, Clock, CheckCircle2, 
  Calendar, Filter, ChevronLeft, ChevronRight,
  Eye, Edit3, ShoppingCart, Loader2
} from 'lucide-react';
import AddPedidoModal from "../../features/pedidos/components/AddPedido";
import { formatarData } from '../../utilities/formatarData';
import { listarPedidos } from "../../features/pedidos/repository";

// --- Tipagens ---
interface Pedido {
  id: string;
  cliente: string;
  tipo: 'Corporativo' | 'Residencial';
  endereco: string;
  produto: string;
  quantidade: number;
  valor_total: string;
  created_at: string;
  status: 'Em Rota' | 'Pendente' | 'Entregue' | 'Cancelado';
}

const PedidosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NOVOS ESTADOS PARA PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // Carrega os pedidos ao montar a tela
  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const dados = await listarPedidos();
      setPedidos(dados as Pedido[]);
    } catch (error) {
      console.error("Erro ao buscar os pedidos do repositório:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Toda vez que o usuário mudar o filtro de status ou digitar na busca, 
  // nós resetamos ele para a primeira página para evitar bugs visuais.
  useEffect(() => {
    setPaginaAtual(1);
  }, [activeTab, filtroTexto]);

  // --- 1. Filtragem ---
  const pedidosFiltrados = pedidos.filter(pedido => {
    const bateTexto = 
      pedido.cliente.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      pedido.id.toLowerCase().includes(filtroTexto.toLowerCase());

    if (activeTab === 'Todos') return bateTexto;
    return bateTexto && pedido.status === activeTab;
  });

  // --- 2. Lógica Matemática da Paginação (Corte dos Itens) ---
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  
  // Esta é a lista final de apenas 5 itens que vai para a tela!
  const pedidosPaginados = pedidosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  // Calcula o total de páginas necessário
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);

  // --- Contadores Dinâmicos para os Cards ---
  const totalHoje = pedidos.length;
  const totalPendentes = pedidos.filter(p => p.status === 'Pendente').length;
  const totalConcluidos = pedidos.filter(p => p.status === 'Entregue').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Em Rota': return 'bg-blue-100 text-blue-800';
      case 'Pendente': return 'bg-amber-100 text-amber-800';
      case 'Entregue': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-[#f9f9f9] font-sans">
      
      {/* Header com busca e ação de registro */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40] font-manrope">Gerenciamento de Pedidos</h2>
          <p className="text-sm text-slate-500">Controle o fluxo de entregas, vendas diretas e rotas em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-4 self-end lg:self-auto">
          <div className="relative w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-linear-to-r from-[#00658d] to-[#001e40] text-white font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/20 hover:opacity-90 transition-transform active:scale-95 text-sm"
          >
            <ShoppingCart size={18} />
            Registrar Novo Pedido
          </button>
        </div>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pedidos Cadastrados', value: loading ? '...' : totalHoje, trend: 'Total geral no banco', icon: <ReceiptText size={24}/>, bg: 'bg-white', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Pendentes', value: loading ? '...' : totalPendentes, sub: 'Aguardando entrega', icon: <Clock size={24}/>, bg: 'bg-white', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { label: 'Concluidos (Entregues)', value: loading ? '...' : totalConcluidos, sub: 'Finalizados com sucesso', icon: <CheckCircle2 size={24}/>, bg: 'bg-white', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-[#001e40] font-manrope">{card.value}</h3>
              {card.trend && <p className="text-[10px] text-blue-600 font-bold mt-2">ℹ {card.trend}</p>}
              {card.sub && <p className="text-[10px] text-slate-400 font-medium mt-2">{card.sub}</p>}
            </div>
            <div className={`p-3.5 h-fit rounded-xl ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Pendente', 'Entregue', 'Cancelado'].map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTab(tag)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tag ? 'bg-[#001e40] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tag === 'Entregue' ? 'Concluídos' : tag}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Data do Pedido</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#00658d]" size={20} />
                      <span className="text-sm font-medium">Buscando dados da distribuidora...</span>
                    </div>
                  </td>
                </tr>
              ) : pedidosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm font-medium text-slate-400">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                // Mapeia a lista paginada de 5 itens
                pedidosPaginados.map((pedido, index) => (
                  <tr key={pedido.id || index} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{pedido.cliente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{pedido.endereco?.toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">{pedido.produto}</span>
                    </td>
                    <td className="px-6 py-4">{pedido.quantidade}</td>
                    <td className="px-6 py-4 font-bold text-sm text-slate-800">{pedido.valor_total}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatarData(pedido.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${getStatusStyle(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
                        <button className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de Paginação Dinâmica */}
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50/30 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">
            Mostrando {indicePrimeiroItem + 1} - {Math.min(indiceUltimoItem, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
          </span>
          
          <div className="flex gap-1 items-center">
            {/* Botão de Voltar */}
            <button 
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className={`p-1.5 rounded border border-slate-200 transition-all ${
                paginaAtual === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'
              }`}
            >
              <ChevronLeft size={18}/>
            </button>

            {/* Renderização Inteligente das Páginas Dinâmicas */}
            {Array.from({ length: totalPaginas }, (_, index) => {
              const numeroDaPagina = index + 1;
              return (
                <button
                  key={numeroDaPagina}
                  onClick={() => setPaginaAtual(numeroDaPagina)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    paginaAtual === numeroDaPagina
                      ? 'bg-[#001e40] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-500 hover:bg-white'
                  }`}
                >
                  {numeroDaPagina}
                </button>
              );
            })}

            {/* Botão de Avançar */}
            <button 
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className={`p-1.5 rounded border border-slate-200 transition-all ${
                paginaAtual === totalPaginas || totalPaginas === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'
              }`}
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Componente Modal Controlado */}
      <AddPedidoModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          carregarPedidos(); // Atualiza a tabela automaticamente ao criar um novo pedido
        }}
      />

    </div>
  );
};

export default PedidosPage;