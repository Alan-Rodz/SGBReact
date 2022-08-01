import jsPDF from 'jspdf';
import autoTable, { jsPDFDocument } from 'jspdf-autotable';

import { saleHeaders } from '../constant';
import { SaleInfo } from '../type';
import { createSaleInfoRows } from '../util';

// ********************************************************************************
export const createBookSalePDF = (saleId: string, employeeId: string, employeeName: string, saleInfo: SaleInfo) => {
  // -- Title ---------------------------------------------------------------------
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Sistema de Gestión Bibliotecaria', 15, 20);

  // -- Body ----------------------------------------------------------------------
  doc.setFontSize(12);
  doc.text('Comprobante de Venta', 15, 30);

  doc.setFontSize(10);
  doc.text(`ID de la Venta: ${saleId}`, 15, 40);
  doc.text(`Nombre del Empleado: ${employeeName}`, 15, 50);

  // -- Table ---------------------------------------------------------------------
  autoTable(doc, {
    head: [saleHeaders],
    body: createSaleInfoRows(saleInfo.products, saleInfo.taxRatePercentage),
    startY: 55,
  });

  // -- Footer --------------------------------------------------------------------
  doc.text(`Costo Total de la Venta (MXN): $${saleInfo.totalSalePrice}`, 15, (doc as jsPDFDocument).lastAutoTable.finalY + 10);
  return doc;
};
