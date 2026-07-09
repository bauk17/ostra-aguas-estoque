import React, { useState, useEffect } from 'react';

import {

  Search, ReceiptText, Clock, CheckCircle2,

  Calendar, Filter, ChevronLeft, ChevronRight,

  Edit3, ShoppingCart, Loader2, X, Trash2

} from 'lucide-react';

import AddPedidoModal from "../../features/pedidos/components/AddPedido";

import EditPedidoModal from '../../features/pedidos/components/EditPedido';

import { formatarData } from '../../utilities/formatarData';

import { listarPedidos } from "../../features/pedidos/repository";

import { atualizarStatusPedido } from '../../features/pedidos/repository';



// --- Tipagens ---

interface Pedido {

  id: string;
  cliente_id?: string;
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




  // --- ESTADOS PARA EDIÇÃO ---

  const [pedidoParaEditar, setPedidoParaEditar] = useState<Pedido | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  // --- NOVOS ESTADOS PARA FILTRO DE DATA ---

  const [dataInicio, setDataInicio] = useState('');

  const [dataFim, setDataFim] = useState('');

  const [mostrarPainelData, setMostrarPainelData] = useState(false);



  // --- PAGINAÇÃO ---

  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);



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



  // Reseta a paginação caso qualquer filtro mude

  useEffect(() => {

    setPaginaAtual(1);

  }, [activeTab, filtroTexto, dataInicio, dataFim]);



  // --- LÓGICA DE FILTRAGEM COMBINADA (Status + Cliente/ID + Período de Datas) ---

  const pedidosFiltrados = pedidos.filter(pedido => {

    // 1. Filtro por Status (Abas)

    if (activeTab !== 'Todos' && pedido.status !== activeTab) {

      return false;

    }



    // 2. Filtro por Texto (Cliente ou ID)

    const bateTexto =

      pedido.cliente.toLowerCase().includes(filtroTexto.toLowerCase()) ||

      pedido.id.toLowerCase().includes(filtroTexto.toLowerCase());

    if (!bateTexto) return false;



    // 3. Filtro por Período de Data

    if (pedido.created_at) {

      const dataPedidoFormatada = pedido.created_at.split('T')[0];



      if (dataInicio && dataPedidoFormatada < dataInicio) {

        return false;

      }

      if (dataFim && dataPedidoFormatada > dataFim) {

        return false;

      }

    }
    return true;

  });

  const limparFiltrosData = () => {

    setDataInicio('');

    setDataFim('');

  };

  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);



  const totalGeral = pedidos.length;
  const totalPendentes = pedidos.filter(p => p.status === 'Pendente').length;
  const totalConcluidos = pedidos.filter(p => p.status === 'Entregue').length;
  const statusOptions: Pedido['status'][] = ['Pendente', 'Em Rota'];
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Em Rota': return 'bg-blue-100 text-blue-800';
      case 'Pendente': return 'bg-amber-100 text-amber-800';
      case 'Entregue': return 'bg-green-200 text-green-900 font-extrabold';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  const getTableRowStyle = (status: string) => {

    if (status === 'Entregue') {

      return 'bg-green-50/40 border-l-4 border-l-green-500 hover:bg-green-100/40';
    }
    return 'hover:bg-blue-50/30 border-l-4 border-l-transparent';

  };



  function handleDeletarPedido(id: string): void {
    const pedidoExistente = pedidos.find(pedido => pedido.id === id);
    if (!pedidoExistente) {
      console.warn(`Pedido com id ${id} não encontrado para exclusão.`);
      return;

    }
    const confirmar = window.confirm(`Deseja realmente excluir o pedido de ${pedidoExistente.cliente}?`);

    if (!confirmar) return;



    setPedidos(prevPedidos => prevPedidos.filter(pedido => pedido.id !== id));

    setPaginaAtual(1);

  }


const alterarStatus = async (
  id: string,
  novoStatus: Pedido["status"]
) => {
  try {
    await atualizarStatusPedido(id, novoStatus);

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === id
          ? { ...pedido, status: novoStatus }
          : pedido
      )
    );

    setStatusMenuId(null);

  } catch (err) {
    console.error(err);
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

          { label: 'Pedidos Cadastrados', value: loading ? '...' : totalGeral, trend: 'Total geral no banco', icon: <ReceiptText size={24}/>, bg: 'bg-white', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },

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

      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">

        <div className="flex flex-wrap gap-2">

          {['Todos', 'Pendente', 'Em Rota', 'Entregue', 'Cancelado'].map(tag => (

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

         

          <button

            onClick={() => setMostrarPainelData(!mostrarPainelData)}

            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${

              mostrarPainelData || dataInicio || dataFim

                ? 'bg-blue-50 border-blue-200 text-blue-700'

                : 'border-slate-200 text-slate-600 hover:bg-slate-50'

            }`}

          >

            <Filter size={16} /> Filtro por Data {(dataInicio || dataFim) && '•'}

          </button>

        </div>

      </div>



      {/* Painel Expansível de Filtro de Datas */}

      {mostrarPainelData && (

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs mb-6 flex flex-wrap items-end gap-4 animate-in fade-in duration-200">

          <div className="flex flex-col gap-1.5">

            <label className="text-xs font-bold text-slate-500">Data Inicial</label>

            <input

              type="date"

              value={dataInicio}

              onChange={(e) => setDataInicio(e.target.value)}

              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#00658d] transition-colors"

            />

          </div>



          <div className="flex flex-col gap-1.5">

            <label className="text-xs font-bold text-slate-500">Data Final</label>

            <input

              type="date"

              value={dataFim}

              onChange={(e) => setDataFim(e.target.value)}

              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#00658d] transition-colors"

            />

          </div>



          {(dataInicio || dataFim) && (

            <button

              onClick={limparFiltrosData}

              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 h-fit pb-2.5 transition-colors"

            >

              <X size={14} /> Limpar Datas

            </button>

          )}

         

          <p className="text-[11px] text-slate-400 ml-auto pb-2.5">

            Filtrando <strong>{pedidosFiltrados.length}</strong> de {totalGeral} registros.

          </p>

        </div>

      )}



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

                    Nenhum pedido encontrado para os filtros selecionados.

                  </td>

                </tr>

              ) : (

                pedidosPaginados.map((pedido, index) => (

                  <tr

                    key={pedido.id || index}

                    className={`transition-colors group border-b border-slate-100 ${getTableRowStyle(pedido.status)}`}

                  >

                    <td className="px-6 py-4">

                      <div className="flex flex-col">

                        <span className="text-sm font-bold text-slate-700">{pedido.cliente}</span>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 max-w-50 truncate">{pedido.endereco?.toUpperCase()}</td>

                    <td className="px-6 py-4">

                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">{pedido.produto}</span>

                    </td>

                    <td className="px-6 py-4">{pedido.quantidade}</td>

                    <td className="px-6 py-4 font-bold text-sm text-slate-800">{pedido.valor_total}</td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatarData(pedido.created_at)}</td>

                   <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setStatusMenuId(
                            statusMenuId === pedido.id ? null : pedido.id
                          )
                        }
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight cursor-pointer transition hover:brightness-95 ${getStatusStyle(
                          pedido.status
                        )}`}
                      >
                        {pedido.status}
                      </button>

                      {statusMenuId === pedido.id && (
                        <div className="absolute z-50 mt-2 w-40 bg-white border rounded-xl shadow-lg overflow-hidden">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => alterarStatus(pedido.id, status)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                                status === pedido.status
                                  ? "bg-blue-50 font-semibold text-blue-700"
                                  : ""
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">

                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                       

                        {/* BOTÃO EDITAR ATUALIZADO */}

                        <button

                          className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"

                          onClick={() => {

                            setPedidoParaEditar(pedido);

                            setIsEditModalOpen(true);

                          }}

                        >

                          <Edit3 size={18}/>

                        </button>



                        <button className="p-1.5 text-slate-300 hover:text-red-600 transition-colors" onClick={() => handleDeletarPedido(pedido.id)}>

                          <Trash2 size={18}/>

                        </button>

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

            Mostrando {pedidosFiltrados.length > 0 ? indicePrimeiroItem + 1 : 0} - {Math.min(indiceUltimoItem, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos

          </span>

         

          <div className="flex gap-1 items-center">

            <button

              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}

              disabled={paginaAtual === 1}

              className={`p-1.5 rounded border border-slate-200 transition-all ${

                paginaAtual === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'

              }`}

            >

              <ChevronLeft size={18}/>

            </button>



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

      <AddPedidoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          carregarPedidos();
        }}
      />

      <EditPedidoModal
        open={isEditModalOpen}
        pedido={pedidoParaEditar}
        onClose={() => {
          setIsEditModalOpen(false);
          setPedidoParaEditar(null);
        }}
        onSuccess={() => {
          carregarPedidos(); // Recarrega a tabela após salvar
        }}

      />

    </div>

  );

};

export default PedidosPage;



