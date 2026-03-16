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

      await this.investmentService.importInvestments(investments);

      console.log('Import completed successfully.');
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Error during import process:', error.message);
      throw error;
    }
  }
}
