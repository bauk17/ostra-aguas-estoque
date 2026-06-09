import { criarCarga } from '../repository';
import { calcularLucro } from '../utils/calcularLucro';

interface CriarCargaDTO {
  produto: string;
  quantidade: string;
  custo_unitario: string;
  preco_venda: string;
  quebras?: string;
  created_at?: string;
  updated_at?: string;
}

export async function criarCargaService(data: CriarCargaDTO) {
  const quantidade = Number(data.quantidade);
  const custoUnitario = Number(data.custo_unitario);
  const precoVenda = Number(data.preco_venda);
  const quebras = Number(data.quebras) || 0;

  // validações
  if (!data.produto.trim()) {
    throw new Error('Produto obrigatório');
  }

  if (Number.isNaN(quantidade) || quantidade <= 0) {
    throw new Error('Quantidade inválida');
  }

  if (Number.isNaN(custoUnitario) || custoUnitario < 0) {
    throw new Error('Custo inválido');
  }

  if (Number.isNaN(precoVenda) || precoVenda < 0) {
    throw new Error('Preço de venda inválido');
  }

  const lucroCalculado = calcularLucro(
    precoVenda,
    custoUnitario,
    quantidade
  );

  return criarCarga({
    id: crypto.randomUUID(),
    produto: data.produto,
    quantidade,
    custo_unitario: custoUnitario,
    preco_venda: precoVenda,
    lucro_esperado: lucroCalculado,
    quebras,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}