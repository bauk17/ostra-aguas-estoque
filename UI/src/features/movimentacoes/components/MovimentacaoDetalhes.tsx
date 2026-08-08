import { useEffect, useState } from 'react';
import { X, Loader2, Package, ClipboardList } from 'lucide-react';

import type { Movimentacao } from '../types';
import { formatMovimentacaoDescricao } from '../utils/formatMovimentacaoDescricao';
import { buscarCarga } from '../../estoque/repository';
import type { Carga } from '../../estoque/types';
import { calcularCustoQuebras, calcularLucro } from '../../estoque/utils/calcularLucro';
import { buscarPedido } from '../../pedidos/repository';

interface PedidoDetalhe {
  id: string;
  cliente_id: string;
  produto: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  status: string;
  created_at: string;
}

interface Props {
  movimentacao: Movimentacao | null;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function MovimentacaoDetalhes({ movimentacao, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [carga, setCarga] = useState<Carga | null>(null);
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null);

  useEffect(() => {
    if (!movimentacao?.referencia_id) {
      setCarga(null);
      setPedido(null);
      return;
    }

    const carregarDetalhes = async () => {
      setLoading(true);
      setCarga(null);
      setPedido(null);

      try {
        if (movimentacao.origem === 'carga') {
          const data = await buscarCarga(movimentacao.referencia_id!);
          setCarga(data);
        } else if (movimentacao.origem === 'entrega') {
          const data = await buscarPedido(movimentacao.referencia_id!) as PedidoDetalhe | null;
          setPedido(data);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da movimentação:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
  }, [movimentacao]);

  if (!movimentacao) return null;

  const quebras = carga?.quebras ?? 0;
  const valorQuebras = carga?.valor_quebras ?? 0;
  const totalQuebras = calcularCustoQuebras(quebras, valorQuebras);
  const lucroLiquido = carga
    ? calcularLucro(
        carga.preco_venda ?? 0,
        carga.custo_unitario,
        carga.quantidade,
        quebras,
        valorQuebras,
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#001e40]">Detalhes da Movimentação</h2>
            <p className="text-sm text-slate-500 mt-1">{formatMovimentacaoDescricao(movimentacao)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DetailItem label="ID" value={`#${movimentacao.id.slice(0, 8)}...`} />
            <DetailItem
              label="Data/Hora"
              value={new Date(movimentacao.created_at).toLocaleString('pt-BR')}
            />
            <DetailItem label="Tipo" value={movimentacao.tipo} />
            <DetailItem label="Origem" value={movimentacao.origem} />
            <DetailItem label="Produto" value={movimentacao.produto} />
            <DetailItem label="Quantidade" value={`${movimentacao.quantidade} un`} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">Carregando detalhes vinculados...</span>
            </div>
          ) : movimentacao.origem === 'carga' && carga ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#001e40] font-bold">
                <Package size={18} />
                <span>Registro de Carga Vinculado</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DetailItem label="Produto" value={carga.produto} />
                <DetailItem label="Quantidade" value={`${carga.quantidade} un`} />
                <DetailItem label="Custo Unitário" value={formatCurrency(carga.custo_unitario)} />
                <DetailItem label="Preço de Venda" value={formatCurrency(carga.preco_venda ?? 0)} />
                <DetailItem label="Quebras" value={`${quebras} un`} />
                <DetailItem label="Custo por Quebra" value={formatCurrency(valorQuebras)} />
                <DetailItem label="Total em Quebras" value={formatCurrency(totalQuebras)} />
                <DetailItem label="Lucro Projetado" value={formatCurrency(lucroLiquido)} />
                <DetailItem
                  label="Data da Carga"
                  value={new Date(carga.created_at).toLocaleString('pt-BR')}
                />
              </div>
            </div>
          ) : movimentacao.origem === 'entrega' && pedido ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#001e40] font-bold">
                <ClipboardList size={18} />
                <span>Pedido Vinculado</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DetailItem label="Produto" value={pedido.produto} />
                <DetailItem label="Quantidade" value={`${pedido.quantidade} un`} />
                <DetailItem label="Preço Unitário" value={formatCurrency(pedido.preco_unitario)} />
                <DetailItem label="Valor Total" value={formatCurrency(pedido.valor_total)} />
                <DetailItem label="Status" value={pedido.status} />
                <DetailItem
                  label="Data do Pedido"
                  value={new Date(pedido.created_at).toLocaleString('pt-BR')}
                />
              </div>
            </div>
          ) : movimentacao.referencia_id ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium">
              Não foi possível localizar o registro vinculado. Ele pode ter sido removido.
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-sm font-medium">
              Esta movimentação não possui registro vinculado para exibir detalhes adicionais.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#001e40] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
