import { criarCarga } from '../repository';
import { calcularLucro } from '../utils/calcularLucro';
import { criarMovimentacao } from "../../movimentacoes/repository"

interface CriarCargaDTO {
  produto: string;
  quantidade: number;
  custo_unitario: number;
  preco_venda: number;
  quebras?: number;
  created_at?: string;
  updated_at?: string;
  retornaveis?: number;
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

  const cargaId = crypto.randomUUID();

  console.log("Criando carga");

  const carga = await criarCarga({
    id: cargaId,
    produto: data.produto,
    quantidade,
    custo_unitario: custoUnitario,
    preco_venda: precoVenda,
    lucro_esperado: lucroCalculado,
    quebras,
    created_at: new Date().toISOString(),
  });
  console.log("Carga criada");

  console.log("Criando movimentação");


  
  await criarMovimentacao({
    id: crypto.randomUUID(),
    tipo: 'entrada',
    origem: 'carga',
    produto: data.produto,
    referencia_id: cargaId,
    quantidade,
    created_at: new Date().toISOString(),
  });


  
  console.log("Movimentação criada");
  return carga;
}