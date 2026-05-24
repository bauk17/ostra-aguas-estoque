import React, { useState } from 'react';
import { CircleX, Save, UserRoundPlus } from 'lucide-react';
import { criarCliente } from "../../features/clientes/repository"

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Caso queira recarregar uma lista de clientes após salvar
}

export default function AddClienteModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', // Valor inicial do radio button
    telefone: '',
    endereco: '',
    created_at: new Date().toISOString(),
    observacoes: '',
  });

  if (!open) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui você vai chamar a função correspondente do seu repository futuramente
      console.log('Dados do cliente enviados:', formData);
      
      // Simulação de salvamento:
      await criarCliente({ id: crypto.randomUUID(), ...formData });

      if (onSuccess) onSuccess();
      
      // Reseta o form e fecha o modal
      setFormData({ nome: '', telefone: '', endereco: '', created_at: new Date().toISOString(), observacoes: '' });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001e40]/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,30,64,0.3)] overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
      >
        {/* */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#00658d]">
              <UserRoundPlus />
            </div>
            <div>
              <h3 className="text-[#001e40] text-xl font-bold leading-none mb-1">
                Cadastrar Novo Cliente
              </h3>
              <p className="text-slate-500 text-sm">
                Insira as informações básicas para o novo registro.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl"><CircleX /></span>
          </button>
        </div>

        {/* */}
        <div className="px-8 py-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#001e40] block">Nome Completo</label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold"
              placeholder="Ex: João da Silva Santos"
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* */}

            {/* */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#001e40] block">Telefone</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                
                </span>
                <input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-5 pr-4 py-3 bg-slate-40 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold"
                  placeholder="(00) 00000-0000"
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#001e40] block">Endereço de Entrega</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">
                
              </span>
              <textarea
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
                className="w-full pl-5 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold resize-none"
                placeholder="Rua, Número, Bairro, Cidade, Ponto de referência..."
                rows={2}
              />
            </div>
          </div>

          {/* */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#001e40] block">
              Observações <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#00658d] transition-all outline-none text-sm font-semibold resize-none"
              placeholder="Restrições de horário, detalhes de acesso, etc."
              rows={3}
            />
          </div>
        </div>

        {/* */}
        <div className="px-8 py-6 bg-slate-50 flex items-center justify-end gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors rounded-full active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-linear-to-r from-[#00658d] to-[#001e40] text-white text-sm font-bold shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              <Save/>
            </span>
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}