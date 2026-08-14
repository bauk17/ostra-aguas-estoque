export type PedidoRow = {
    id: string;
    cliente: string;
    endereco: string;
    produto: string;
    valor_total: number;
    quantidade: number;
    status: string;
    carga_id?: string | null;
    carga_produto?: string | null;
    created_at: string;
};
