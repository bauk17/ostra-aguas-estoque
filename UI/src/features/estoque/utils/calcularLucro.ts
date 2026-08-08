export function calcularCustoQuebras(quebras: number, valorQuebras: number) {
  return quebras * valorQuebras;
}

export function calcularLucro(
  precoVenda: number,
  custoUnitario: number,
  quantidade: number,
  quebras = 0,
  valorQuebras = 0,
) {
  const lucroBruto = (precoVenda - custoUnitario) * quantidade;
  return lucroBruto - calcularCustoQuebras(quebras, valorQuebras);
}