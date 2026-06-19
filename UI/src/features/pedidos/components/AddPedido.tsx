import { ArrowDown, Minus, Plus, ShoppingCart, UserRoundSearch, ChevronDown, Loader2, X, Save } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { criarPedido } from '../repository';

import { listarClientes } from '../../clientes/repository'; 

interface Client {
  id: string;
  nome: string;
  observacoes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddPedidoModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estados para a listagem e filtro de clientes
  const [clientes, setClientes] = useState<Client[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    cliente_id: '', // Agora armazenará o ID real do banco
    produto: '',
    quantidade: 1,
    preco_unitario: 18.50,
    observacoes: '',
  });

  const [valorTotal, setValorTotal] = useState(18.50);

  // Carrega os clientes do banco de dados ao abrir o modal
  useEffect(() => {
    if (open) {
      const buscarClientes = async () => {
        setLoadingClientes(true);
        try {
          const dados = await listarClientes();
          setClientes(dados);
        } catch (error) {
          console.error("Erro ao carregar clientes para o seletor:", error);
        } finally {
          setLoadingClientes(false);
        }
      };
      buscarClientes();
    }
  }, [open]);

  // Fecha o dropdown de clientes se clicar fora do elemento
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalcula o valor total automaticamente
  useEffect(() => {
    const total = formData.quantidade * (Number(formData.preco_unitario) || 0);
    setValorTotal(total);
  }, [formData.quantidade, formData.preco_unitario]);

  if (!open) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantidade' || name === 'preco_unitario' ? Number(value) : value,
    }));
  };

  const alterarQuantidade = (fator: number) => {
    setFormData((prev) => ({
      ...prev,
      quantidade: Math.max(1, prev.quantidade + fator),
    }));
  };

  // Filtra a lista de clientes baseando-se no que foi digitado no input
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
    (cliente.observacoes && cliente.observacoes.includes(searchCliente))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id) {
      alert("Por favor, selecione um cliente válido da lista.");
      return;
    }
    setLoading(true);

    try {
      await criarPedido({
        id: crypto.randomUUID(),
        cliente_id: formData.cliente_id, // Enviando o ID real verificado por FK
        produto: formData.produto,
        quantidade: formData.quantidade,
        preco_unitario: formData.preco_unitario,
        valor_total: valorTotal,
        status: 'Pendente',
        created_at: new Date(),
      });

      if (onSuccess) onSuccess();

      // Reseta os estados e fecha o modal
      setFormData({ cliente_id: '', produto: '', quantidade: 1, preco_unitario: 18.50, observacoes: '' });
      setSearchCliente('');
      onClose();
      alert('Pedido registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Erro ao salvar pedido no banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001e40]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 bg-slate-50 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00658d]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                <ShoppingCart />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#001e40]">Novo Pedido</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Cadastro de Venda Direta
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined"><X /></span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Cliente Autocomplete/Dropdown */}
          <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-[#001e40] ml-1">Cliente</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00658d]">
                {loadingClientes ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <UserRoundSearch size={18} />
                )}
              </span>
              <input
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setIsDropdownOpen(true);
                  // Se o usuário apagar o texto, removemos o ID selecionado
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, cliente_id: '' }));
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                required
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800"
                placeholder="Digite o nome, CPF ou CNPJ do cliente..."
                type="text"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </span>
            </div>

            {/* Dropdown de Clientes Filtrados */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                {clientesFiltrados.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">
                    Nenhum cliente cadastrado com esse nome
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, cliente_id: cliente.id }));
                        setSearchCliente(cliente.nome);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors flex justify-between items-center text-sm font-semibold text-slate-700"
                    >
                      <span>{cliente.nome}</span>
                      {cliente.observacoes && (
                        <span className="text-xs text-slate-400 font-normal">{cliente.observacoes}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Produto e Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#001e40] ml-1">Produto</label>
              <div className="relative">
                <select
                  name="produto"
                  value={formData.produto}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800"
                >
                  <option value="" disabled>Selecione um item</option>
                  <option value="Galão 20L - Água Mineral Ostra">Galão 20L - Água Mineral Ostra</option>
                  <option value="Pack 12x 500ml - Água Mineral Ostra">Pack 12x 500ml - Água Mineral Ostra</option>
                  <option value="Copo 200ml (Caixa 48 un)">Copo 200ml (Caixa 48 un)</option>
                  <option value="Galão 10L - Água Mineral Ostra">Galão 10L - Água Mineral Ostra</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <ArrowDown size={18} />
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#001e40] ml-1">Quantidade</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-[#00658d] transition-all">
                <button 
                  type="button" 
                  onClick={() => alterarQuantidade(-1)}
                  className="px-4 py-3.5 text-[#00658d] hover:bg-blue-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  name="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  className="w-full text-center bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  type="button" 
                  onClick={() => alterarQuantidade(1)}
                  className="px-4 py-3.5 text-[#00658d] hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Preço Unitário e Valor Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#001e40] ml-1">Preço Unitário</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-sm">R$</span>
                <input
                  name="preco_unitario"
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco_unitario}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex justify-between items-center h-[50px]">
              <span className="text-xs font-bold text-[#00658d] uppercase tracking-wider">Valor Total</span>
              <div className="text-right flex items-baseline gap-1">
                <span className="text-xs font-bold text-[#00658d]">R$</span>
                <span className="text-xl font-black text-[#001e40]">
                  {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Observações de Entrega */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#001e40] ml-1">Observações de Entrega</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800 resize-none"
              placeholder="Ex: Deixar na portaria, campainha estragada..."
              rows={2}
            />
          </div>

          {/* Footer Operações */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-bold text-sm text-slate-500 hover:text-slate-800 transition-colors rounded-xl uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#001e40] text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="text-lg" />
              {loading ? 'Salvando...' : 'Salvar Pedido'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}