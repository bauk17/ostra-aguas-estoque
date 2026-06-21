import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { criarCargaService } from '../services/criarCargaService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Disparado para atualizar a lista na página pai
  statusMsg?: string;
}

export default function AddCargaModal({ open, onClose, onSuccess, statusMsg }: Props) {
  const [loading, setLoading] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null); // 👈 Estado para armazenar o erro do banco

  // Mantendo como strings internamente para digitação completamente livre
  const [formData, setFormData] = useState({
    produto: 'Galão 20L Premium',
    quantidade: '',
    custo_unitario: '',
    preco_venda: '',
    quebras: '',
    retornaveis: '',
  });

  // Limpa o log de erro toda vez que o modal abre ou fecha
  useEffect(() => {
    if (!open) {
      setErroMsg(null);
    }
  }, [open]);

  if (!open) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    setErroMsg(null); // Reseta o erro antes de tentar uma nova inserção

    // Validação e coerção de tipo estrita antes do envio ao Service/Banco
    const qtd = Number(formData.quantidade) || 0;
    const custo = parseFloat(formData.custo_unitario.replace(',', '.')) || 0;
    const venda = parseFloat(formData.preco_venda.replace(',', '.')) || 0;
    const quebras = Number(formData.quebras) || 0;
    const retornaveis = Number(formData.retornaveis) || 0;

    try {
      await criarCargaService({
        produto: formData.produto,
        quantidade: qtd,
        custo_unitario: custo,
        preco_venda: venda,
        quebras: quebras,
        retornaveis: retornaveis,
      });

      // Notifica o pai para atualizar os registros na tela
      onSuccess();
      
      // Reseta o estado interno do modal
      setFormData({
        produto: 'Galão 20L Premium',
        quantidade: '',
        custo_unitario: '',
        preco_venda: '',
        quebras: '',
        retornaveis: '',
      });
      onClose();
    }  catch (error) {
        console.error("Falha na operação de banco de dados (Cargas):", error);
        
        // 👈 Tratamento estrito para extrair texto de qualquer tipo de retorno do backend
        if (error instanceof Error) {
          setErroMsg(`Erro (Error Instance): ${error.message}`);
        } else if (typeof error === 'string') {
          setErroMsg(`Erro (Backend String): ${error}`);
        } else if (typeof error === 'object' && error !== null) {
          setErroMsg(`Erro (Backend Object): ${JSON.stringify(error)}`);
        } else {
          setErroMsg("Erro totalmente desconhecido ao persistir dados.");
        }
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="relative bg-white w-200 max-h-[90vh] rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#001e40]">Registrar Nova Carga</h2>
            <p className="text-sm text-slate-400">Entrada de estoque</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          
          {/* LOG VISUAL DE SUCESSO/INFO */}
          {statusMsg && (
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-100">
              {statusMsg}
            </div>
          )}

          {/* 🔥 NOVO: LOG VISUAL DE ERRO DO BANCO DE DADOS */}
          {erroMsg && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <span className="font-bold block mb-0.5">Falha de Persistência</span>
                <p className="font-medium text-red-600/90 font-mono text-xs">{erroMsg}</p>
              </div>
            </div>
          )}

          {/* 1. Produto */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-[#001e40] mb-4">1. Produto</h3>
            <select
              name="produto"
              value={formData.produto}
              onChange={handleInputChange}
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100 bg-white font-semibold text-slate-800"
            >
              <option value="Galão 20L Premium">Galão 20L Premium</option>
              <option value="Galão 20L - Água Mineral Vale do Sol">Galão 20L - Água Mineral Vale do Sol</option>
            </select>
          </div>

          {/* 2. Detalhes do Estoque */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-[#001e40] mb-4">2. Detalhes do Estoque</h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                name="quantidade"
                type="text"
                required
                value={formData.quantidade}
                onChange={handleInputChange}
                placeholder="Quantidade"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100 bg-white font-semibold"
              />
              <input
                name="custo_unitario"
                type="text"
                required
                value={formData.custo_unitario}
                onChange={handleInputChange}
                placeholder="Preço Custo (R$)"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100 bg-white font-semibold"
              />
              <input
                name="preco_venda"
                type="text"
                required
                value={formData.preco_venda}
                onChange={handleInputChange}
                placeholder="Preço Venda (R$)"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-emerald-100 bg-white font-semibold"
              />
            </div>
          </div>

          {/* 3 & 4. Extras */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-[#001e40] mb-4">3. Quebras</h3>
              <input
                name="quebras"
                type="text"
                placeholder="Quantidade un."
                value={formData.quebras}
                onChange={handleInputChange}
                className="border border-slate-200 rounded-xl p-3 w-full outline-none bg-white font-semibold"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-slate-200 font-semibold text-slate-600 transition-colors hover:bg-slate-300">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl bg-[#00658d] text-white font-semibold shadow-lg shadow-blue-900/20 hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </div>
  );
}