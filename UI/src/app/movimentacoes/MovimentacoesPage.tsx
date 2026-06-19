import { useState, useEffect } from 'react';
import {
  Search,Filter,Calendar,Download,ChevronLeft,ChevronRight
} from 'lucide-react';
import { listarMovimentacoes } from '../../features/movimentacoes/repository';
import type { Movimentacao } from '../../features/movimentacoes/types';


export default function MovimentacoesPage() {

    useEffect(() => {
        const fetchMovimentacoes = async () => {
          try {
            const data = await listarMovimentacoes();
            setMovimentacoes(data);
          } catch (error) {
            console.error('Erro ao buscar movimentações:', error);
          }
        };

        fetchMovimentacoes();
    }, []);
  // Estados de dados
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([

  ]);

  // Estados de Controle de UI
 

  // Estados de Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos os Tipos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('Todos os Períodos');

  // Estados de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;





  // --- LÓGICA DE FILTRAGEM DINÂMICA ---
  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
    // 1. Filtro por barra de pesquisa (Produto ou ID)
    const correspondeBusca = 
      mov.produto.toLowerCase().includes(busca.toLowerCase()) || 
      mov.id.toLowerCase().includes(busca.toLowerCase());

    // 2. Filtro por Tipo select
    const correspondeTipo = filtroTipo === 'Todos os Tipos' || mov.tipo === filtroTipo;

    // 3. Filtro de Período (Exemplo simplificado baseado no dia atual simulado)
    let correspondePeriodo = true;
    if (filtroPeriodo === 'Hoje') {
      const hojeStr = new Date().toLocaleDateString('pt-BR');
      const dataMovStr = new Date(mov.created_at).toLocaleDateString('pt-BR');
      correspondePeriodo = hojeStr === dataMovStr;
    }

    return correspondeBusca && correspondeTipo && correspondePeriodo;
  });

  // --- REGRA MATEMÁTICA DE PAGINAÇÃO (LIMITADO A 6 REGISTROS) ---
  useEffect(() => { setPaginaAtual(1); }, [busca, filtroTipo, filtroPeriodo]);

  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const registrosPaginados = movimentacoesFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(movimentacoesFiltradas.length / itensPorPagina);

  return (
    <div className="bg-[#f9f9f9] min-h-screen font-sans text-[#1a1c1c] p-8">
            {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40] tracking-tight font-headline-md">
            Movimentações de Estoque
          </h2>
          <p className="text-sm text-slate-500">
            Controle detalhado de entradas, saídas de produtos
          </p>
        </div>
      </header>


      {/* Filter Bar */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-blue-50 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por produto ou código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:border-[#00658d] focus:ring-4 focus:ring-[#00658d]/10 rounded-lg text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-auto">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full md:w-auto appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-[#00658d]/20 outline-none"
            >
              <option>Todos os Tipos</option>
              <option>Entrada</option>
              <option>Saída</option>
              <option>Quebra</option>
            </select>
          </div>

          <div className="relative w-full md:w-auto">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full md:w-auto appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-[#00658d]/20 outline-none"
            >
              <option>Todos os Períodos</option>
              <option>Hoje</option>
              <option>Últimos 7 dias</option>
            </select>
          </div>

          <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
            <Download size={16} />
          </button>
        </div>
      </section>

      {/* Movements Table Container */}
      <section className="bg-white rounded-2xl shadow-xs border border-blue-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[#001e40] font-semibold text-xs border-b border-blue-50">
                <th className="px-6 py-4 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-4 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 uppercase tracking-wider">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-sm">
              {registrosPaginados.length > 0 ? (
                registrosPaginados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#00658d]">#{mov.id.slice(0, 8) + "..."}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">
                          {new Date(mov.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(mov.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        
                        <span className="font-medium text-slate-800">{mov.produto}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        mov.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700' :
                        mov.tipo === 'saida' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          mov.tipo === 'entrada' ? 'bg-emerald-500' :
                          mov.tipo === 'saida' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">{mov.quantidade}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Nenhuma movimentação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-blue-50 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs font-medium text-slate-400">
            Mostrando {movimentacoesFiltradas.length > 0 ? indicePrimeiroItem + 1 : 0} - {Math.min(indiceUltimoItem, movimentacoesFiltradas.length)} de {movimentacoesFiltradas.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className={`p-1.5 rounded border border-slate-200 transition-all ${
                paginaAtual === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaAtual(i + 1)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  paginaAtual === i + 1 ? 'bg-[#001e40] text-white' : 'border border-slate-200 text-slate-500 hover:bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className={`p-1.5 rounded border border-slate-200 transition-all ${
                paginaAtual === totalPaginas || totalPaginas === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

     
    </div>
  );
}