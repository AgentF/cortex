import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Document } from '@cortex/shared'; // Import here too

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Document {
    return this.appService.getHello();
  }
}