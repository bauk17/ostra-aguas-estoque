export type Carga = {
  id: string;
  produto: string;
  quantidade: number;
  custo_unitario: number;
  preco_venda: number | null;
  lucro_esperado: number | null;
  quebras: number | null;
  created_at: string;
};


