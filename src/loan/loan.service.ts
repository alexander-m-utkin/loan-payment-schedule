import { BadRequestException, Injectable } from '@nestjs/common';
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

  calculateSchedule(loan: Loan) {
    const { amount, issuedAt, loanTenureDays, paymentPeriodDays, rate } = loan;

    if (loanTenureDays <= 0 || paymentPeriodDays <= 0) {
      throw new BadRequestException('Invalid loan tenure or payment period');
    }

    const periods = Math.floor(loanTenureDays / paymentPeriodDays);
    if (periods <= 0) {
      throw new BadRequestException(
        'Payment period is greater than loan tenure',
      );
    }

    if (loanTenureDays % paymentPeriodDays !== 0) {
      throw new BadRequestException(
        'Loan tenure must be divisible by payment period',
      );
    }

    const amountCents = Math.round(amount * 100);
    const annualRate = rate;
    const periodRate = (annualRate * paymentPeriodDays) / 365;

    const schedule: {
      paymentNumber: number;
      paymentDate: string;
      principal: number;
      interest: number;
    }[] = [];

    let remainingCents = amountCents;

    let paymentCents: number;
    if (periodRate === 0) {
      paymentCents = Math.round(amountCents / periods);
    } else {
      const r = periodRate;
      const annuity = (amount * r) / (1 - Math.pow(1 + r, -periods)); // in currency units
      paymentCents = Math.round(annuity * 100);
    }

    let totalPrincipalCents = 0;

    for (let i = 1; i <= periods; i++) {
      const interestCents = Math.round(remainingCents * periodRate);
      let principalCents = paymentCents - interestCents;

      if (principalCents < 0) {
        throw new BadRequestException('Calculated principal is negative');
      }

      if (principalCents > remainingCents) {
        principalCents = remainingCents;
      }

      remainingCents -= principalCents;
      totalPrincipalCents += principalCents;

      const paymentDate = new Date(issuedAt);
      paymentDate.setDate(paymentDate.getDate() + i * paymentPeriodDays);

      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString(),
        principal: +(principalCents / 100).toFixed(2),
        interest: +(interestCents / 100).toFixed(2),
      });
    }

    const diff = amountCents - totalPrincipalCents;
    if (Math.abs(diff) > 1) {
      // adjust last payment principal to fix rounding
      const last = schedule[schedule.length - 1];
      const lastPrincipalCents = Math.round(last.principal * 100) + diff;
      if (lastPrincipalCents <= 0) {
        throw new BadRequestException(
          'Rounding adjustment led to non-positive last principal',
        );
      }

      last.principal = +(lastPrincipalCents / 100).toFixed(2);
    }

    // final validation
    const sumPrincipal = schedule.reduce(
      (acc, item) => acc + item.principal,
      0,
    );
    const sumPrincipalCents = Math.round(sumPrincipal * 100);
    if (sumPrincipalCents !== amountCents) {
      throw new BadRequestException(
        'Total principal over schedule does not equal loan amount',
      );
    }

    return schedule;
  }
}
