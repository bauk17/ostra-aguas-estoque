import React from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  formData: {
    produto: string;
    quantidade: number;
    custo_unitario: number;
    preco_venda: number;
    quebras: number;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export default function AddCargaModal({
  open,
  onClose,
  onSubmit,
  loading,
  formData,
  handleInputChange,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={onSubmit}
        className="relative bg-white w-[800px] max-h-[90vh] rounded-2xl shadow-xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#001e40]">
              Registrar Nova Carga
            </h2>

            <p className="text-sm text-slate-400">
              Entrada de estoque
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">

          {/* Produto */}
          <div className="bg-slate-50 p-5 rounded-2xl mb-5 border border-slate-100">
            <h3 className="font-bold text-[#001e40] mb-4">
              1. Produto
            </h3>

            <select
              name="produto"
              value={formData.produto}
              onChange={handleInputChange}
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
            >
              <option value="Galão 20L Premium">
                Galão 20L Premium
              </option>
            </select>
          </div>

          {/* Estoque */}
          <div className="bg-slate-50 p-5 rounded-2xl mb-5 border border-slate-100">
            <h3 className="font-bold text-[#001e40] mb-4">
              2. Detalhes do Estoque
            </h3>

            <div className="grid grid-cols-3 gap-4">

              <input
                name="quantidade"
                type="number"
                required
                value={formData.quantidade}
                onChange={handleInputChange}
                placeholder="Quantidade"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="custo_unitario"
                type="number"
                step="0.01"
                required
                value={formData.custo_unitario}
                onChange={handleInputChange}
                placeholder="Preço Custo"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="preco_venda"
                type="number"
                step="0.01"
                required
                value={formData.preco_venda}
                onChange={handleInputChange}
                placeholder="Preço Venda"
                className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-emerald-100"
              />

            </div>
          </div>

          {/* Extra */}
          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-[#001e40] mb-4">
                3. Quebras
              </h3>

              <input
                name="quebras"
                type="number"
                placeholder="Quantidade"
                value={formData.quebras}
                onChange={handleInputChange}
                className="border border-slate-200 rounded-xl p-3 w-full outline-none"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-[#001e40] mb-4">
                4. Vasilhames Retornáveis
              </h3>

              <input
                type="number"
                placeholder="Quantidade"
                className="border border-slate-200 rounded-xl p-3 w-full outline-none"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50">
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-200 font-semibold text-slate-600"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-[#00658d] text-white font-semibold shadow-lg shadow-blue-900/20 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>

        </div>
      </form>
    </div>
  );
}