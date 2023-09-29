import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './custom-exceptions/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError:true,
    exceptionFactory: (err) =>{
      throw new BadRequestException(err.map(e => {return {message:Object.values(e.constraints)[0], field:e.property}}))
    }
  }))
  app.useGlobalFilters(new HttpExceptionFilter)
  await app.listen(3000);
}
bootstrap();
