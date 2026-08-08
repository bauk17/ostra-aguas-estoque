import type { Movimentacao } from '../types';

export function formatMovimentacaoDescricao(mov: Movimentacao): string {
  if (mov.origem === 'carga' && mov.tipo === 'entrada') {
    return 'Usuário adicionou uma nova carga';
  }

  if (mov.origem === 'entrega' && mov.tipo === 'saida') {
    return 'Saída de estoque por entrega de pedido';
  }

  if (mov.tipo === 'entrada') {
    return 'Entrada de estoque';
  }

  if (mov.tipo === 'saida') {
    return 'Saída de estoque';
  }

  return 'Movimentação registrada';
}
