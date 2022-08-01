import { ProductInfo } from './type';

// ********************************************************************************
export const createSaleInfoRows = (products: ProductInfo[], taxRatePercentage: number) => {
  const rows: (string | number)[][] = [];
  products.forEach(product => rows.push(createSaleInfoRow(product.productName, product.quantity, product.price, taxRatePercentage, product.totalProductPrice)));
  return rows;
}
const createSaleInfoRow = (productName: string, price: number, quantity: number, taxRatePercentage: number, totalProductPrice: number) => 
  [productName, price, quantity, `${taxRatePercentage}%`, totalProductPrice];
