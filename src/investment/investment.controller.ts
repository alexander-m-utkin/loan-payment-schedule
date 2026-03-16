import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InvestmentService } from './investment.service';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Get(':id/schedule')
  async getInvestorSchedule(@Param('id') id: string) {
    try {
      return await this.investmentService.calculateInvestorSchedule(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
