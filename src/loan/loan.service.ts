import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';
import { LoanScheduleItem } from './types/loanSchedule.type';
import { InvestmentService } from '../investment/investment.service';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @Inject(forwardRef(() => InvestmentService))
    private readonly investmentService: InvestmentService,
  ) {}

  async findById(id: string): Promise<Loan | null> {
    return this.loanRepository.findOne({
      where: { id },
      relations: { investments: true },
    });
  }

  async createLoan(loanData: Partial<Loan>): Promise<Loan> {
    const newLoan = this.loanRepository.create({
      ...loanData,
      amount: Math.floor(loanData.amount || 0),
    });
    return this.loanRepository.save(newLoan);
  }

  async increaseLoan(loanId: string, increase: number): Promise<boolean> {
    const loan = await this.loanRepository.findOne({ where: { id: loanId } });

    if (!loan) return false;

    await this.loanRepository.update(loanId, {
      amount: Math.floor(loan.amount + increase),
    });

    return true;
  }

  calculateSchedule(loan: Loan): LoanScheduleItem[] {
    const { amount, issuedAt, loanTenureDays, paymentPeriodDays, rate } = loan;

    if (loanTenureDays <= 0 || paymentPeriodDays <= 0) {
      throw new BadRequestException('Invalid loan tenure or payment period');
    }

    const periodsCount = Math.floor(loanTenureDays / paymentPeriodDays);
    if (periodsCount <= 0) {
      throw new BadRequestException(
        'Payment period is greater than loan tenure',
      );
    }

    // Ставка за один день
    const dailyRate = rate / 365;

    // Начисления по процентам за весь займ целиком
    const realInterest = Math.floor(amount * loanTenureDays * dailyRate);

    // Расчетный основной долг за один платежный период
    const periodAmount = Math.floor(amount / periodsCount);

    // Процентная ставка за платежный период
    const periodRate = dailyRate * paymentPeriodDays;

    // Расчетные начисления по процентам за один платежный период
    const periodInterest = Math.floor(periodRate * amount);

    const schedules: LoanScheduleItem[] = [];

    // Подсчет значений по периодам
    for (let i = 1; i <= periodsCount; i++) {
      const paymentDate = new Date();
      paymentDate.setDate(issuedAt.getDate() + 30);

      schedules.push({
        paymentNumber: i,
        paymentDate,
        principal: periodAmount,
        interest: periodInterest,
      });
    }

    // ИСПРАВЛЕНИЕ ПОГРЕШНОСТЕЙ.
    // Сравниваем расчеты за весь срок целиком и сумму периодов (долг и проценты).
    // Разницу распределяем по платежам, остаток добавляем в последний платеж.

    // для основного долга:
    const schedulesAmount = periodAmount * periodsCount;
    const amountDif = Math.floor(amount - schedulesAmount);
    if (amountDif !== 0) {
      // Распределим разницу по всем платежам
      const periodAmountDif = Math.floor(amountDif / periodsCount);
      schedules.forEach(
        (item, i) => (schedules[i].principal += periodAmountDif),
      );

      // Неделимый остаток добавим в последний платеж:
      schedules[schedules.length - 1].principal += Math.floor(
        amountDif % periodsCount,
      );
    }

    // для процентов:
    const schedulesInterest = periodInterest * periodsCount;
    const interestDif = Math.floor(realInterest - schedulesInterest);
    if (interestDif !== 0) {
      // Распределим разницу по всем платежам
      const periodInterestDif = Math.floor(interestDif / periodsCount);
      schedules.forEach(
        (item, i) => (schedules[i].interest += periodInterestDif),
      );

      // Неделимый остаток добавим в последний платеж:
      schedules[schedules.length - 1].interest += Math.floor(
        interestDif % periodsCount,
      );
    }

    // Добавляем расчеты по инвестициям
    schedules.forEach(
      (item) =>
        (item.investments =
          this.investmentService.calculateInvestmentsSchedule(loan)),
    );

    // ПРОВЕРКИ:
    console.log('Основной долг займа целиком:', amount);

    console.log(
      'Сумма основного долга по запланированным платежам:',
      schedules.reduce((sum, item) => sum + item.principal, 0),
    );

    console.log(
      'Начислений по процентам целиком:',
      amount * dailyRate * loanTenureDays,
    );

    console.log(
      'Сумма начислений по процентам по запланированным платежам:',
      schedules.reduce((sum, item) => sum + item.interest, 0),
    );

    // Маппинг
    schedules.forEach((item) => {
      item.paymentDate =
        item.paymentDate instanceof Date
          ? item.paymentDate.toISOString().split('T')[0]
          : item.paymentDate;
      item.interest /= 100;
      item.principal /= 100;
    });

    return schedules;
  }
}
