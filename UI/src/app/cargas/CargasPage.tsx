import { useState, useEffect, useRef } from 'react';
import {
  PlusSquare,
  Droplets,
  Truck,
  CircleDollarSign,
  AlertCircle,
  Edit3,
  Trash2,
  TrendingUp,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { listarCargasService } from '../../features/estoque/services/listarCargaService';
import { deletarCarga } from '../../features/estoque/repository';
import type { Carga } from '../../features/estoque/types';
import AddCargaModal from '../../features/estoque/components/AddCarga';
import { calcularCustoQuebras, calcularLucro } from '../../features/estoque/utils/calcularLucro';

export default function CargasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cargas, setCargas] = useState<Carga[]>([]);

  // Estados para filtro de data
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Controle visual para expansão/foco do painel de datas
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Referência para detectar cliques fora do container de datas
  const dateFilterRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS PARA PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const fetchCargas = async () => {
    try {
      const data = await listarCargasService();
      setCargas(data);
    } catch (error) {
      console.error('Erro ao listar cargas:', error);
    }
  };

  useEffect(() => {
    fetchCargas();
  }, []);

  // --- NOVA FUNÇÃO PARA DELETAR CARGA ---
  const handleDeletarCarga = async (id: string | number) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este registro de carga permanentemente?");
    if (!confirmar) return;

    const idString = String(id);

    try {
      await deletarCarga(idString);
      await fetchCargas();
      
      if (cargasPaginadas.length === 1 && paginaAtual > 1) {
        setPaginaAtual(prev => prev - 1);
      }
    } catch (error) {
      console.error('Erro ao deletar carga:', error);
      alert('Não foi possível deletar esta carga.');
    }
  };

  // Detecta cliques fora do painel de seleção de datas
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsFilterActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  // Reseta para a primeira página sempre que os filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [dataInicio, dataFim]);

  // --- LÓGICA DE FILTRAGEM ---
  const cargasFiltradas = cargas.filter((carga) => {
    if (!carga.created_at) return true;

    const dataCarga = new Date(carga.created_at);
    const ano = dataCarga.getFullYear();
    const mes = String(dataCarga.getMonth() + 1).padStart(2, '0');
    const dia = String(dataCarga.getDate()).padStart(2, '0');
    const dataCargaString = `${ano}-${mes}-${dia}`;

    if (dataInicio && dataCargaString < dataInicio) return false;
    if (dataFim && dataCargaString > dataFim) return false;

    return true;
  });

  // --- LÓGICA MATEMÁTICA DA PAGINAÇÃO ---
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const cargasPaginadas = cargasFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(cargasFiltradas.length / itensPorPagina);

  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
  };

  const totalQuantidade = cargasFiltradas.reduce((acc, curr) => acc + curr.quantidade, 0);
  const valorTotalEstoque = cargasFiltradas.reduce((acc, curr) => acc + curr.quantidade * curr.custo_unitario, 0);
  const valorTotalQuebras = cargasFiltradas.reduce(
    (acc, curr) => acc + calcularCustoQuebras(curr.quebras ?? 0, curr.valor_quebras ?? 0),
    0,
  );
  const lucroProjetado = cargasFiltradas.reduce(
    (acc, curr) =>
      acc +
      calcularLucro(
        curr.preco_venda ?? 0,
        curr.custo_unitario,
        curr.quantidade,
        curr.quebras ?? 0,
        curr.valor_quebras ?? 0,
      ),
    0,
  );

  return (
    <div className="p-8 space-y-6 font-manrope min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Controle de Cargas</h2>
          <p className="text-sm text-slate-500">Gerencie o estoque de garrafões e entradas recentes.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-[#00658d] to-[#001e40] text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:opacity-90 self-end sm:self-auto"
        >
          <PlusSquare size={20} />
          Adicionar Carga
        </button>
      </div>

      {/* Barra de Filtros */}
      <div 
        ref={dateFilterRef}
        onClick={() => setIsFilterActive(true)}
        className={`bg-white p-4 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isFilterActive ? 'border-[#00658d] ring-4 ring-[#00658d]/5' : 'border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold">
            <Calendar size={16} className={isFilterActive ? 'text-[#00658d]' : 'text-slate-500'} />
            <span>Filtrar por Data:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-medium text-slate-700 px-3 py-2 rounded-xl outline-none focus:border-[#00658d] transition-all"
            />
            <span className="text-slate-400 text-xs font-bold">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-medium text-slate-700 px-3 py-2 rounded-xl outline-none focus:border-[#00658d] transition-all"
            />
          </div>

          {(dataInicio || dataFim) && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                limparFiltros();
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-2 rounded-xl border border-red-100 transition-colors"
            >
              <RefreshCw size={12} /> Limpar Filtro
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-400">
          Exibindo <span className="text-[#00658d]">{cargasFiltradas.length}</span> de {cargas.length} registros
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total em Cargas" value={totalQuantidade.toString()} icon={<Droplets className="text-blue-600" />} iconBg="bg-blue-50" />
        <StatCard title="Entradas" value={cargasFiltradas.length.toString()} icon={<Truck className="text-purple-600" />} iconBg="bg-purple-50" />
        <StatCard title="Investimento" value={`R$ ${valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<CircleDollarSign className="text-cyan-600" />} iconBg="bg-cyan-50" />
        <StatCard title="Total em Quebras" value={`R$ ${valorTotalQuebras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<AlertCircle className="text-red-600" />} iconBg="bg-red-50" />
        <StatCard title="Lucro Projetado" value={`R$ ${lucroProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="text-green-600" />} iconBg="bg-green-50" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Quantidade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Quantidade Final</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Preço de Venda</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lucro Esperado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Quebras</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargasPaginadas.length > 0 ? (
                cargasPaginadas.map((carga) => (
                  <ProductRow key={carga.id} carga={carga} onDeletar={handleDeletarCarga} />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Nenhuma carga encontrada para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Paginação */}
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">
            Mostrando {cargasFiltradas.length > 0 ? indicePrimeiroItem + 1 : 0} - {Math.min(indiceUltimoItem, cargasFiltradas.length)} de {cargasFiltradas.length} cargas
          </span>
          
          <div className="flex gap-1 items-center">
            <button 
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className={`p-1.5 rounded border border-slate-200 transition-all ${paginaAtual === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'}`}
            >
              <ChevronLeft size={16}/>
            </button>

            {Array.from({ length: totalPaginas }, (_, index) => {
              const numeroDaPagina = index + 1;
              return (
                <button
                  key={numeroDaPagina}
                  onClick={() => setPaginaAtual(numeroDaPagina)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${paginaAtual === numeroDaPagina ? 'bg-[#001e40] text-white shadow-xs' : 'border border-slate-200 text-slate-500 hover:bg-white'}`}
                >
                  {numeroDaPagina}
                </button>
              );
            })}

            <button 
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className={`p-1.5 rounded border border-slate-200 transition-all ${paginaAtual === totalPaginas || totalPaginas === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-white'}`}
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Passando apenas controle visual e o trigger de sucesso */}
      <AddCargaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCargas}
      />
    </div>
  );
}

interface ProductRowProps {
  carga: Carga;
  onDeletar: (id: string | number) => void;
}

function ProductRow({ carga, onDeletar }: ProductRowProps) {
  const dataFormatada = new Date(carga.created_at || '').toLocaleDateString('pt-BR');
  const lucroLiquido = calcularLucro(
    carga.preco_venda ?? 0,
    carga.custo_unitario,
    carga.quantidade,
    carga.quebras ?? 0,
    carga.valor_quebras ?? 0,
  );

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
      <td className="px-6 py-4 font-bold text-[#001e40]">{carga.produto}</td>
      <td className="px-6 py-4">{carga.quantidade}</td>
      <td className="px-6 py-4">{carga.quantidade_final}</td>
      <td className="px-6 py-4">R$ {carga.custo_unitario.toFixed(2)}</td>
      <td className="px-6 py-4">R$ {carga.preco_venda?.toFixed(2)}</td>
      <td className="px-6 py-4 text-emerald-600 font-bold">R$ {lucroLiquido.toFixed(2)}</td>
      <td className="px-6 py-4 text-red-500 font-medium">{carga.quebras || 0} un</td>
      <td className="px-6 py-4 text-slate-400">{dataFormatada}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1.5">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => carga.id !== undefined ? onDeletar(carga.id) : alert("ID inválido.")}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            title="Excluir carga"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({ title, value, icon, iconBg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div className="mt-4">
        <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-[#001e40] mt-1">{value}</p>
      </div>
    </div>
  );
}