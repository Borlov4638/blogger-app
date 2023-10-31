import { Module } from '@nestjs/common';
import { SecDevController } from './sec-dev.controller';
import { SecDevService } from './sec-dev.service';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SecDevController],
  providers: [SecDevService],
  imports: [CqrsModule, AuthModule],
})
export class SecDevModule {}
