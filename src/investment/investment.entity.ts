import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Entity()
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false })
  investorId: string;

  @Column('float', { nullable: false })
  investmentAmount: number;

  @Column('varchar', { nullable: false })
  state: string;

  @ManyToOne(() => Loan, { nullable: false })
  loan: Loan;

  @Column('float', { nullable: false })
  investorStrategyRate: number;
}
