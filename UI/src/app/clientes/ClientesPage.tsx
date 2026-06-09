import { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Users, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  MapPin,
  Phone
} from 'lucide-react';
import AddClienteModal from '../../features/clientes/components/AddCustomer';
import { listarClientes } from '../../features/clientes/repository';

// Interface mapeada exatamente igual à estrutura do seu banco de dados
interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  created_at: string;
  observacoes?: string | null;
}

const ClientesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');

  // --- ESTADOS PARA PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // Carrega os clientes do repositório
  const carregarClientes = async () => {
    setLoading(true);
    try {
      const dados = await listarClientes();
      setClientes(dados);
    } catch (error) {
      console.error("Erro ao carregar clientes do banco:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Reseta para a primeira página quando o usuário filtra/pesquisa algo
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTexto]);

  // Gera as iniciais do avatar com base no nome do cliente
  const obterIniciais = (nome: string) => {
    if (!nome) return '??';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  // --- 1. Filtragem dinâmica ---
  const clientesFiltrados = clientes.filter(cliente => {
    const nomeBate = cliente.nome.toLowerCase().includes(filtroTexto.toLowerCase());
    const telefoneBate = cliente.telefone ? cliente.telefone.includes(filtroTexto) : false;
    return nomeBate || telefoneBate;
  });

  // --- 2. Lógica Matemática da Paginação (Corte dos Itens) ---
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  
  // Lista final contendo apenas os 5 clientes da página atual
  const clientesPaginados = clientesFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  // Calcula a quantidade total de páginas
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-8">
      {/* Header Area */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40] mb-1 font-manrope">Diretório de Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de consumidores cadastrados no sistema.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00658d] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="bg-white border border-blue-100 rounded-full pl-12 pr-6 py-3 w-80 focus:ring-4 focus:ring-[#00658d]/10 focus:border-[#00658d] outline-none transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-linear-to-r from-[#00658d] to-[#001e40] text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#00658d]/20 hover:opacity-90 transition-transform active:scale-95 text-sm"
          >
            <UserPlus size={20} />
            Registrar Novo Cliente
          </button>
        </div>
      </header>

      {/* Card de Métrica Simples */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-xs flex items-center gap-4 w-fit min-w-[280px]">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#00658d]">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">Clientes Cadastrados</p>
            <p className="text-3xl font-bold text-[#001e40] font-manrope">
              {loading ? "..." : clientes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-3xl border border-blue-50 shadow-xs overflow-hidden">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-blue-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome do Cliente</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço de Entrega</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data de Cadastro</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observações</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#00658d]" size={20} />
                      <span className="text-sm font-semibold">Buscando dados no banco local...</span>
                    </div>
                  </td>
                </tr>
              ) : clientesPaginados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm font-medium text-slate-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                // Mapeia a lista fatiada (máximo de 5 registros)
                clientesPaginados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Nome & ID */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-blue-100 text-blue-700">
                          {obterIniciais(cliente.nome)}
                        </div>
                        <div>
                          <p className="font-bold text-[#001e40] text-sm">{cliente.nome}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {cliente.id.substring(0, 8).toUpperCase()}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Endereço */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 max-w-xs truncate">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{cliente.endereco ? cliente.endereco.charAt(0).toUpperCase() + cliente.endereco.slice(1) : 'Não informado'}</span>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>{cliente.telefone || 'Sem telefone'}</span>
                      </div>
                    </td>

                    {/* Data de Criação */}
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Observações */}
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-400 italic max-w-[180px] truncate">
                        {cliente.observacoes || 'Sem notas'}
                      </p>
                    </td>

                    {/* Ações */}
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-[#00658d] transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer com Paginação Ativa */}
        <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-blue-50">
          <p className="text-sm text-slate-500">
            Exibindo <span className="font-bold text-[#001e40]">{indicePrimeiroItem + 1}</span> - <span className="font-bold text-[#001e40]">{Math.min(indiceUltimoItem, clientesFiltrados.length)}</span> de <span className="font-bold text-[#001e40]">{clientesFiltrados.length}</span> clientes
          </p>
          
          <div className="flex items-center gap-2">
            {/* Botão Anterior */}
            <button 
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className={`w-10 h-10 rounded-lg border border-blue-100 flex items-center justify-center transition-all ${
                paginaAtual === 1 ? 'text-slate-200 cursor-not-allowed bg-slate-50' : 'text-slate-400 hover:bg-white'
              }`}
            >
              <ChevronLeft size={20}/>
            </button>

            {/* Numeração de Páginas Dinâmicas */}
            {Array.from({ length: totalPaginas }, (_, index) => {
              const numeroDaPagina = index + 1;
              return (
                <button
                  key={numeroDaPagina}
                  onClick={() => setPaginaAtual(numeroDaPagina)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    paginaAtual === numeroDaPagina
                      ? 'bg-[#00658d] text-white shadow-xs'
                      : 'border border-transparent text-slate-500 hover:bg-white'
                  }`}
                >
                  {numeroDaPagina}
                </button>
              );
            })}

            {/* Botão Próximo */}
            <button 
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className={`w-10 h-10 rounded-lg border border-blue-100 flex items-center justify-center transition-all ${
                paginaAtual === totalPaginas || totalPaginas === 0 ? 'text-slate-200 cursor-not-allowed bg-slate-50' : 'text-slate-400 hover:bg-white'
              }`}
            >
              <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de cadastro integrado */}
      <AddClienteModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          carregarClientes(); // Atualiza a tabela imediatamente após registrar
        }}
      />
    </div>
  );
};

export default ClientesPage;