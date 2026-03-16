import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentService } from './investment.service';
import { Investment } from './investment.entity';
import { LoanModule } from '../loan/loan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Investment]), LoanModule],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
