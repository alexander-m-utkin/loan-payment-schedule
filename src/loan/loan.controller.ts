import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { LoanService } from './loan.service';

type PaymentScheduleItem = {
  paymentNumber: number;
  paymentDate: string;
  principal: number;
  interest: number;
};

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get(':id/schedule')
  async getLoanSchedule(
    @Param('id') id: string,
  ): Promise<PaymentScheduleItem[]> {
    const loan = await this.loanService.findById(id);

    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }

    return this.loanService.calculateSchedule(loan);
  }
}
