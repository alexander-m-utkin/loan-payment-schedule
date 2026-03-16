import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanService } from './loan.service';
import { Loan } from './loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [LoanService],
  exports: [LoanService], // Export LoanService if it will be used by other modules
})
export class LoanModule {}
