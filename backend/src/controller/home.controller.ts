import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }

  @Get('/health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'sports-booking-system',
    };
  }
}
