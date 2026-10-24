import { Module } from '@nestjs/common';
import { MedicalPackagesService } from './medical-packages.service';
import { MedicalPackagesController } from './medical-packages.controller';
import { CommissionTiersController } from './commission-tiers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MedicalPackagesController, CommissionTiersController],
  providers: [MedicalPackagesService],
  exports: [MedicalPackagesService],
})
export class MedicalPackagesModule {}
