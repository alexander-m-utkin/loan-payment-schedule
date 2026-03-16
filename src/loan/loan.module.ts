import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanService } from './loan.service';
import { Loan } from './loan.entity';
import { LoanController } from './loan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [LoanService],
  controllers: [LoanController],
  exports: [LoanService],
})
export class LoanModule {}
