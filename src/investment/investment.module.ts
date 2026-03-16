import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentService } from './investment.service';
import { Investment } from './investment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Investment])],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
