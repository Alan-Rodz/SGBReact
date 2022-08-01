// ********************************************************************************
// == Type ========================================================================
export type MembershipSalePDFInfo = {
  employeeId: string;
  employeeName: string;
  libraryUserName: string;
  libraryUserEmail: string;
  membershipExpDate: string;
}

// == Interface ===================================================================
export interface MembershipSaleRequestBody {
  saleFields: {
    currentMembershipPrice: number;
    currentTaxRatePercentage: number
    totalSalePrice: number;
    employeeId: string;
    employeeName: string;
  };

  libraryUserFields: {
    libraryUserName: string;
    libraryUserEmail: string;
    membershipExpDate: string;
  };
}

