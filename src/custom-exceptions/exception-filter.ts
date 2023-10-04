import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    

    const errorResponse : any = exception.getResponse()
    const errors = errorResponse.message
    if(status ===400 && (exception.message === 'invalid code' || exception.message === 'invalid email')){
      response
      .status(status)
      .json({errorsMessages:[{message:exception.message, field:exception.message.split(' ')[1]}]})
    }  
    else if(status ===400 && (exception.message === 'registration email' || exception.message === 'registration login')){
      response
      .status(status)
      .json({errorsMessages:[{message:exception.message, field:exception.message.split(' ')[1]}]})
    }else if(status === 400)
    {
      response
        .status(status)
        .json({errorsMessages:errors})
    }else{

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}