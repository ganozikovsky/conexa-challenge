import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }
}
