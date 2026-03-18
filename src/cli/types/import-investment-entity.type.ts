export type ImportInvestmentEntity = {
  loanId: string;
  investorId: string;
  // Сумма инвестиций В РУБЛЯХ, с плавающей запятой
  investmentAmount: number;
  state?: string;
  investorStrategyRate?: number;
};
