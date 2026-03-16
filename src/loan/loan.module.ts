import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';

@Module({
  providers: [LoanService],
  exports: [LoanService], // Export LoanService if it will be used by other modules
})
export class LoanModule {}