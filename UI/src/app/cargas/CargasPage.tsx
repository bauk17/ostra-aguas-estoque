import React, { useState, useEffect } from 'react';
import {
  PlusSquare,
  Droplets,
  Truck,
  CircleDollarSign,
  Edit3,
  TrendingUp,
  X,
  Package,
} from 'lucide-react';

import { criarCarga, listarCargas } from '../../features/estoque/repository';
import type { Carga } from '../../features/estoque/types';

export default function CargasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargas, setCargas] = useState<Carga[]>([]);

  const [formData, setFormData] = useState({
    produto: 'Galão 20L',
    quantidade: '',
    custo_unitario: '',
    preco_venda: '',
    quebras: '',
    retornaveis: '',
  });

  const fetchCargas = async () => {
    try {
      const data = await listarCargas();
      setCargas(data);
    } catch (error) {
      console.error('Erro ao listar cargas:', error);
    }
  };

  useEffect(() => {
    fetchCargas();
  }, []);

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

    try {
      const quantidade = Number(formData.quantidade);
      const custoUnitario = Number(formData.custo_unitario);
      const precoVenda = Number(formData.preco_venda);
      const lucroCalculado = (precoVenda - custoUnitario) * quantidade;

      await criarCarga({
        id: crypto.randomUUID(),
        produto: formData.produto,
        quantidade,
        custo_unitario: custoUnitario,
        preco_venda: precoVenda,
        lucro_esperado: lucroCalculado,
        quebras: Number(formData.quebras) || 0,
      });

      await fetchCargas();

      setFormData({
        produto: 'Galão 20L',
        quantidade: '',
        custo_unitario: '',
        preco_venda: '',
        quebras: '',
        retornaveis: '',
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar carga:', error);
      alert('Erro ao salvar carga.');
    } finally {
      setLoading(false);
    }
  };

  const totalQuantidade = cargas.reduce(
    (acc, curr) => acc + curr.quantidade,
    0
  );

  const valorTotalEstoque = cargas.reduce(
    (acc, curr) => acc + curr.quantidade * curr.custo_unitario,
    0
  );

  const lucroProjetado = cargas.reduce(
    (acc, curr) => acc + (curr.lucro_esperado || 0),
    0
  );

  return (
    <div className="p-8 space-y-6 font-manrope min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">
            Controle de Cargas
          </h2>

          <p className="text-sm text-slate-500">
            Gerencie o estoque de garrafões e entradas recentes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-[#00658d] to-[#001e40] text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:opacity-90"
        >
          <PlusSquare size={20} />
          Adicionar Carga
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total em Cargas"
          value={totalQuantidade.toString()}
          icon={<Droplets className="text-blue-600" />}
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Entradas"
          value={cargas.length.toString()}
          icon={<Truck className="text-purple-600" />}
          iconBg="bg-purple-50"
        />

        <StatCard
          title="Investimento"
          value={`R$ ${valorTotalEstoque.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}`}
          icon={<CircleDollarSign className="text-cyan-600" />}
          iconBg="bg-cyan-50"
        />

        <StatCard
          title="Lucro Projetado"
          value={`R$ ${lucroProjetado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}`}
          icon={<TrendingUp className="text-green-600" />}
          iconBg="bg-green-50"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Produto
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Quantidade
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Custo
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Preço de Venda
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Lucro Esperado
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Quebras
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Data
                </th>

                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {cargas.length > 0 ? (
                cargas.map((carga) => (
                  <ProductRow key={carga.id} carga={carga} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-slate-400 font-medium"
                  >
                    Nenhuma carga cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <form
            onSubmit={handleSubmit}
            className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00658d] text-white flex items-center justify-center shadow-lg">
                  <Package size={26} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#001e40]">
                    Registrar Nova Carga
                  </h2>

                  <p className="text-xs text-slate-400 uppercase font-black tracking-wider">
                    Entrada de estoque
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Produto */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-[#001e40] mb-4">
                  1. Seleção de Produto
                </h3>

                <select
                  name="produto"
                  value={formData.produto}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Galão 20L Premium">
                    Galão 20L
                  </option>

                  <option value="Água Mineral 500ml">
                    Água Mineral 500ml
                  </option>
                </select>
              </div>

              {/* Estoque */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-[#001e40] mb-4">
                  2. Detalhes do Estoque
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleInputChange}
                    placeholder="Quantidade"
                    className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <input
                    type="number"
                    step="0.01"
                    name="custo_unitario"
                    value={formData.custo_unitario}
                    onChange={handleInputChange}
                    placeholder="Preço de Custo (R$)"
                    className="border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <input
                    type="number"
                    step="0.01"
                    name="preco_venda"
                    value={formData.preco_venda}
                    onChange={handleInputChange}
                    placeholder="Preço de Venda (R$)"
                    className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 outline-none focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>

              {/* Perdas + Retornáveis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-[#001e40] mb-4">
                    3. Quebras e Perdas
                  </h3>

                  <input
                    type="number"
                    name="quebras"
                    value={formData.quebras}
                    onChange={handleInputChange}
                    placeholder="Quantidade"
                    className="border border-slate-200 rounded-xl p-3 w-full outline-none focus:ring-4 focus:ring-red-100"
                  />
                </div>

                
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-8 py-6 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#00658d] hover:bg-[#005577] text-white font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Confirmar Entrada'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ProductRow({ carga }: { carga: Carga }) {
  const dataFormatada = new Date(
    carga.created_at || ''
  ).toLocaleDateString('pt-BR');

  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 font-bold text-[#001e40]">
        {carga.produto}
      </td>

      <td className="px-6 py-4">{carga.quantidade}</td>

      <td className="px-6 py-4">
        R$ {carga.custo_unitario.toFixed(2)}
      </td>

      <td className="px-6 py-4">
        R$ {carga.preco_venda?.toFixed(2)}
      </td>

      <td className="px-6 py-4 text-emerald-600 font-bold">
        R$ {carga.lucro_esperado?.toFixed(2)}
      </td>

      <td className="px-6 py-4 text-red-500 font-medium">
        {carga.quebras || 0} un
      </td>

      <td className="px-6 py-4 text-slate-400">
        {dataFormatada}
      </td>

      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <Edit3 size={18} />
        </button>
      </td>
    </tr>
  );
}

function StatCard({ title, value, icon, iconBg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
          {title}
        </p>

        <p className="text-2xl font-bold text-[#001e40] mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}