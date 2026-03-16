import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoanModule } from './loan/loan.module';

@Module({
  imports: [LoanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
