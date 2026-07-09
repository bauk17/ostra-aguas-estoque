import { User, Phone, MapPin, Notebook, X, Save, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { atualizarCliente } from '../repository'; // Ajuste o caminho para o seu repository de clientes

interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
}

interface Props {
  open: boolean;
  cliente: Cliente | null; // Recebe o cliente selecionado para edição
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditClienteModal({ open, cliente, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    observacoes: '',
  });

  // Popula os dados do cliente no formulário assim que o modal abre
  useEffect(() => {
    if (open && cliente) {
      setFormData({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        observacoes: cliente.observacoes || '',
      });
    }
  }, [open, cliente]);

  if (!open || !cliente) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      // Envia os dados higienizados para o repositório
      await atualizarCliente(cliente.id, {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim() || null,
        endereco: formData.endereco.trim() || null,
        observacoes: formData.observacoes.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar o cliente no banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001e40]/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 bg-slate-50 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00658d]">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#001e40]">Editar Cliente</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Alteração de Cadastro Geral
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#001e40] ml-1">Nome Completo</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00658d]">
                <User size={18} />
              </span>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#001e40] ml-1">Telefone / WhatsApp</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00658d]">
                <Phone size={18} />
              </span>
              <input
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800"
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#001e40] ml-1">Endereço de Entrega</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00658d]">
                <MapPin size={18} />
              </span>
              <input
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800"
                placeholder="Rua, Número, Bairro, Cidade"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#001e40] ml-1">Observações do Cliente</label>
            <div className="relative group">
              <span className="absolute top-3 left-4 text-[#00658d]">
                <Notebook size={18} />
              </span>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold text-slate-800 resize-none"
                placeholder="Ex: Cliente prefere receber no período da tarde, possui restrições..."
              />
            </div>
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
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}