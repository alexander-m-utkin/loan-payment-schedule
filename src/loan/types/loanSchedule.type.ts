import { InvestmentPeriodSchedule } from '../../investment/types/investmentPeriodSchedule.type';

export type LoanScheduleItem = {
  paymentNumber: number;
  paymentDate: string | Date;
  principal: number;
  interest: number;
  investments?: InvestmentPeriodSchedule[];
};
