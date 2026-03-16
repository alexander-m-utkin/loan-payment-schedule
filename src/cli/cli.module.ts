import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanModule } from '../loan/loan.module';
import { InvestmentModule } from '../investment/investment.module';
import { ImportInvestmentsCommand } from './import-investments.command';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot(),
    LoanModule,
    InvestmentModule,
  ],
  providers: [ImportInvestmentsCommand],
})
export class CliModule {}
