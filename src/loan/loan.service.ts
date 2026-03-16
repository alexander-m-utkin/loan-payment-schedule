import { Injectable } from '@nestjs/common';

@Injectable()
export class LoanService {
  calculateLoanPaymentSchedule(loanAmount: number, interestRate: number, termInYears: number): any[] {
    // Logic for calculating loan payment schedule
    const schedule = []; // Replace with the proper calculation logic
    return schedule;
  }
}