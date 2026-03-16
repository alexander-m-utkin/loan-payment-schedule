export type ImportInvestmentEntity = {
  loanId: string;
  investorId: string;
  investmentAmount: number;
  state?: string;
  investorStrategyRate?: number;
};
