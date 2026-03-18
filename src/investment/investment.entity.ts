import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Entity()
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false })
  investorId: string;

  // Размер займа в копейках
  @Column('int', { nullable: false })
  investmentAmount: number;

  @Column('varchar', { nullable: false })
  state: string;

  @ManyToOne(() => Loan, (loan) => loan.investments, { nullable: false })
  loan: Loan;

  @Column('float', { nullable: false })
  investorStrategyRate: number;
}
