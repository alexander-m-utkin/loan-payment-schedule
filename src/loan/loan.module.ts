import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanService } from './loan.service';
import { Loan } from './loan.entity';
import { LoanController } from './loan.controller';
import { InvestmentModule } from '../investment/investment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    forwardRef(() => InvestmentModule),
  ],
  providers: [LoanService],
  controllers: [LoanController],
  exports: [LoanService],
})
export class LoanModule {}
