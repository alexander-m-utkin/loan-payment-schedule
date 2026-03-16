import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { LoanService } from '../loan/loan.service';
import { InvestmentService } from '../investment/investment.service';
import { ImportInvestmentEntity } from './types/import-investment-entity.type';

@Injectable()
@Command({
  name: 'import-investments',
  description:
    'Import investments and their associated loans from a JSON file.',
})
export class ImportInvestmentsCommand extends CommandRunner {
  constructor(
    private readonly configService: ConfigService,
    private readonly loanService: LoanService,
    private readonly investmentService: InvestmentService,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const filePath = passedParams[0];
    if (!filePath) {
      throw new Error('Please provide the path to the JSON file.');
    }

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const investments = JSON.parse(fileContent) as ImportInvestmentEntity[];

      if (!Array.isArray(investments)) {
        throw new Error(
          'Invalid data format: Expected an array of investments.',
        );
      }

      for (const entry of investments) {
        if (!entry.loanId || !entry.investorId || !entry.investmentAmount) {
          console.error(
            'Skipping entry due to missing mandatory fields:',
            entry,
          );
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
        await this.investmentService.create({
          investorId: entry.investorId,
          investmentAmount: Number(entry.investmentAmount),
          state: entry.state || 'PENDING',
          id: loan.id,
          investorStrategyRate: Number(entry.investorStrategyRate || '0'),
        });

        console.log(`Successfully imported investment for loan ID: ${loanId}`);
      }

      console.log('Import completed successfully.');
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Error during import process:', error.message);
      throw error;
    }
  }
}
