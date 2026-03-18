import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InvestmentService } from './investment.service';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}
}
