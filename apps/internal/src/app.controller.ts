import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipAuth } from './auth/infrastructure/decorators/skip-auth.decorator';

@Controller()
@ApiTags('Health')
export class AppController {
  @Get()
  @SkipAuth()
  health() {
    return { status: 'ok' };
  }
}
