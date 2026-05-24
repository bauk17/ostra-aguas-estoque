export type PedidoRow = {
    map(arg0: (row: PedidoRow) => { id: string; cliente: string; endereco: string; produto: string; valor_total: string; quantidade: number; status: string; created_at: string; }): unknown;
    id: string;
    cliente: string;
    endereco: string;
    produto: string;
    valor_total: number;
    quantidade: number;
    status: string;
    created_at: string;
};