import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { Loan } from '../loan/loan.entity';
import { LoanService } from '../loan/loan.service';
import { ConfigService } from '@nestjs/config';
import { ImportInvestmentEntity } from '../cli/types/import-investment-entity.type';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
    private readonly loanService: LoanService,
    private readonly configService: ConfigService,
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

  async importInvestments(
    investments: ImportInvestmentEntity[],
  ): Promise<void> {
    for (const entry of investments) {
      if (!entry.loanId || !entry.investorId || !entry.investmentAmount) {
        console.error('Skipping entry due to missing mandatory fields:', entry);
        continue;
      }

      const loanId = entry.loanId;

      // Check if the loan already exists
      let loan = await this.loanService.findById(loanId);

      if (!loan) {
        // Create new loan with default environment variables
        loan = await this.loanService.createLoan({
          id: loanId,
          amount: Number(
            this.configService.get<string>('DEFAULT_IMPORTING_LOAN_AMOUNT') ??
              '0',
          ),
          issuedAt: new Date(
            this.configService.get<string>(
              'DEFAULT_IMPORTING_LOAN_ISSUE_DATE',
            ) ?? new Date().toISOString(),
          ),
          loanTenureDays: Number(
            this.configService.get<string>(
              'DEFAULT_IMPORTING_LOAN_TENURE_DAYS',
            ) ?? '0',
          ),
          paymentPeriodDays: Number(
            this.configService.get<string>(
              'DEFAULT_IMPORTING_LOAN_PAYMENT_PERIOD_DAYS',
            ) ?? '0',
          ),
          rate: Number(
            this.configService.get<string>('DEFAULT_IMPORTING_LOAN_RATE') ??
              '0',
          ),
        });
      }

      // Create investment for the loan
      await this.create({
        investorId: entry.investorId,
        investmentAmount: Number(entry.investmentAmount),
        state: entry.state || 'PENDING',
        loan,
        investorStrategyRate: Number(entry.investorStrategyRate || '0'),
      });

      console.log(`Successfully imported investment for loan ID: ${loanId}`);
    }
  }

  async calculateInvestorSchedule(investmentId: string): Promise<
    {
      paymentNumber: number;
      paymentDate: string;
      principal: number;
      loanInterest: number;
      strategyCompensation: number;
    }[]
  > {
    const investment = await this.investmentRepository.findOne({
      where: { id: investmentId },
      relations: ['loan'],
    });

    if (!investment) {
      throw new Error(`Investment with id ${investmentId} not found`);
    }

    const { loan } = investment;
    const { amount, issuedAt, loanTenureDays, paymentPeriodDays, rate } = loan;

    if (loanTenureDays <= 0 || paymentPeriodDays <= 0) {
      throw new Error('Invalid loan tenure or payment period');
    }

    const periods = Math.floor(loanTenureDays / paymentPeriodDays);
    // const investmentShare = investment.investmentAmount / amount;
    const periodRate = (rate * paymentPeriodDays) / 365;
    const strategyRate =
      (investment.investorStrategyRate || 0) > rate
        ? rate
        : investment.investorStrategyRate;
    const strategyPeriodRate = (strategyRate * paymentPeriodDays) / 365;

    const schedule: {
      paymentNumber: number;
      paymentDate: string;
      principal: number;
      loanInterest: number;
      strategyCompensation: number;
    }[] = [];

    let remainingPrincipal = investment.investmentAmount;

    for (let i = 1; i <= periods; i++) {
      const loanInterest = remainingPrincipal * periodRate;
      const strategyInterest = remainingPrincipal * strategyPeriodRate;
      const strategyCompensation = Math.max(loanInterest - strategyInterest, 0);

      const paymentPrincipal = investment.investmentAmount / periods;

      const paymentDate = new Date(issuedAt);
      paymentDate.setDate(paymentDate.getDate() + i * paymentPeriodDays);

      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString(),
        principal: +paymentPrincipal.toFixed(2),
        loanInterest: +loanInterest.toFixed(2),
        strategyCompensation: +strategyCompensation.toFixed(2),
      });

      remainingPrincipal -= paymentPrincipal;
    }

    return schedule;
  }
}
