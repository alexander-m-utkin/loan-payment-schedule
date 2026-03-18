import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentService } from './investment.service';
import { Investment } from './investment.entity';
import { LoanModule } from '../loan/loan.module';
import { InvestmentController } from './investment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment]),
    forwardRef(() => LoanModule),
  ],
  providers: [InvestmentService],
  exports: [InvestmentService],
  controllers: [InvestmentController],
})
export class InvestmentModule {}
