export type Carga = {
  id: string;
  produto: string;
  quantidade: number;
  quantidade_final: number;
  custo_unitario: number;
  preco_venda: number | null;
  lucro_esperado: number | null;
  quebras: number | null;
  valor_quebras: number | null;
  created_at: string;
};


