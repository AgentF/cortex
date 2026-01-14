import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DocumentDto } from '@cortex/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): DocumentDto {
    return this.appService.getHello();
  }
}
