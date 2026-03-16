import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async findById(id: string): Promise<Loan | null> {
    return this.loanRepository.findOne({ where: { id } });
  }

  async createLoan(loanData: Partial<Loan>): Promise<Loan> {
    const newLoan = this.loanRepository.create(loanData);
    return this.loanRepository.save(newLoan);
  }
}
