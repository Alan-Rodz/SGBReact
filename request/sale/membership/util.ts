import jsPDF from 'jspdf';
import autoTable, { jsPDFDocument } from 'jspdf-autotable';

import { saleHeaders } from '../constant';
import { SaleInfo } from '../type';
import { createSaleInfoRows } from '../util';
import { MembershipSalePDFInfo } from './type'; 

// ********************************************************************************
export const createMembershipSalePDF = (membershipSaleInfo: MembershipSalePDFInfo, saleInfo: SaleInfo) => {
  // -- Title ---------------------------------------------------------------------
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Sistema de Gestión Bibliotecaria', 15, 20);

  // -- Body ----------------------------------------------------------------------
  doc.setFontSize(12);
  doc.text('Comprobante de Venta', 15, 30);

  doc.setFontSize(10);
  doc.text(`Nombre del Empleado: ${membershipSaleInfo.employeeName}`, 15, 40);
  doc.text(`Nombre del Nuevo Usuario: ${membershipSaleInfo.libraryUserName}`, 15, 50);
  doc.text(`Email del Nuevo Usuario: ${membershipSaleInfo.libraryUserEmail}`, 15, 60);
  doc.text(`Fecha de Expiración de la Membresía: ${membershipSaleInfo.membershipExpDate}`, 15, 70);

  // -- Table ---------------------------------------------------------------------
  autoTable(doc, {
    head: [saleHeaders],
    body: createSaleInfoRows(saleInfo.products, saleInfo.taxRatePercentage),
    startY: 75,
  });

  // -- Footer --------------------------------------------------------------------
  doc.text(`Costo Total de la Venta (MXN): $${saleInfo.totalSalePrice}`, 15, (doc as jsPDFDocument).lastAutoTable.finalY + 10);
  return doc;
};
