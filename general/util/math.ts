import { PAGINATION_SIZE } from 'general';

// ********************************************************************************
export const applyTaxRateToPrice = (price: number, taxRatePercentage: number) => price + (price*(taxRatePercentage / 100/*percentage goes from 0-100*/));

export const setupPriceDisplay = (price: number) => price.toFixed(2);

/**
 * Computes the index past which users will be retrieved, given a page 
 * (SEE: PaginationButtons.ts)
 */
 export const computeBiggerThanPageIndex = (requestedPage: number) => 
 (Number(requestedPage) * PAGINATION_SIZE) - PAGINATION_SIZE/*the entries that will be shown*/ - 1/*account for 0 indexing*/;
