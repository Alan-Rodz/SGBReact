import { Book, BookCopy, Sale } from '@prisma/client';
import { NextApiRequest } from 'next';

import { PDFJSONBuffer } from 'general';

// ********************************************************************************
// == Type ========================================================================
// -- General --------------------------------------------------------------------=
export type BookSaleEntry = {
  book: Book;
  bookCopy: BookCopy;
  quantity: number;
}
export type ProductInfo = { 
  productName: string; 
  price: number; 
  quantity: number; 
  totalProductPrice: number; 
}
export type SaleInfo = {
  products: ProductInfo[]
  taxRatePercentage: number;
  totalSalePrice: number;
}

// -- Request Answer --------------------------------------------------------------
export type SaleRequestAnswer = {
  requestedSale: Sale | undefined/*not requesting or posting a sale */;
  requestedSales: Sale[] | undefined/*not requesting sales*/;
  salePDFJSONBuffer: PDFJSONBuffer | undefined/*not requesting the PDF of a sale*/;

  currentSaleInfo: {
    currentMembershipPrice: number;
    currentTaxRatePercentage: number;
  } | undefined/*not requesting the current sale info*/;

  bookCopy: BookCopy  | undefined/*not requesting a bookCopy*/;
  bookCopies: BookCopy[] | undefined/*not requesting the bookCopies of a given bookId*/;
}

// -- Request Body ----------------------------------------------------------------
export type SaleRequestBody = {
  requestedSaleId: number | undefined/*not requesting a Sale's info or not a valid response for the used method*/;
  employeeId: string | undefined/*not posting a sale*/;
  clientEmail: string | undefined/*not posting a sale*/;
  bookSaleEntries: BookSaleEntry[] | undefined/*not posting a sale*/;
};

// -- Query ----------------------------------------------------------------------=
export type SaleQueryParams = {
  saleIdStartsWith: string/*looking for sales whose id starts with*/;
  requestedSalesPage: string/*looking for sales for a page*/;
  saleId: string/*looking for the information of a sale*/;
  bookId: string/*looking for bookCopies of a bookId*/;
  editionNameStartsWith: string/*looking for bookCopies of a bookId*/;
  bookCopyId: string/*looking for a specific bookCopy*/;
}

// == Interface ===================================================================
// -- Request ---------------------------------------------------------------------
export interface SaleRequest extends NextApiRequest {
  query: SaleQueryParams;
  body: SaleRequestBody;
}
