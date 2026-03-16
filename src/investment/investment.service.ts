import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { Loan } from '../loan/loan.entity';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
  ) {}

  findAll(): Promise<Investment[]> {
    return this.investmentRepository.find();
  }

  create(investment: Partial<Investment>): Promise<Investment> {
    const newInvestment = this.investmentRepository.create(investment);
    return this.investmentRepository.save(newInvestment);
  }

  findByInvestorId(investorId: string): Promise<Investment[]> {
    return this.investmentRepository.find({ where: { investorId } });
  }

  findByLoan(loan: Loan): Promise<Investment[]> {
    return this.investmentRepository.find({ where: { loan } });
  }
}
