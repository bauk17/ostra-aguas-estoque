export type Movimentacao = {
  id: string;
  produto: string;
  quantidade: number;
  tipo: "entrada" | "saida";
  origem: "carga" | "entrega";
  referencia_id?: string;
  created_at: string;
};
