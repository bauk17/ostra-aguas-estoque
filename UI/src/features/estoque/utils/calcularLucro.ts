export function calcularLucro(
  precoVenda: number,
  custoUnitario: number,
  quantidade: number
) {
  return (precoVenda - custoUnitario) * quantidade;
}