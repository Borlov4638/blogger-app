import { Module } from '@nestjs/common';
import { SecDevController } from './sec-dev.controller';
import { SecDevService } from './sec-dev.service';

@Module({
  controllers: [SecDevController],
  providers: [SecDevService],
})
export class SecDevModule {}
