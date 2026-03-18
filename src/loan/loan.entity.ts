import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Investment } from '../investment/investment.entity';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Сумма займа в рублях
  @Column('int', { nullable: false })
  amount: number;

  @OneToMany(() => Investment, (investment) => investment.loan)
  investments: Investment[];

  // Дата выдачи займа
  @Column({ nullable: false, type: 'timestamptz' })
  issuedAt: Date;

  // Срок на который выдан займ, в днях
  @Column('int', { nullable: false })
  loanTenureDays: number;

  // Платежный период в днях
  @Column('int', { nullable: false })
  paymentPeriodDays: number;

  // Годовая процентная ставка в формате 0.17
  @Column('float', { nullable: false })
  rate: number;
}
