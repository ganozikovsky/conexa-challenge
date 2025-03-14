import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';

import { MoviesController } from './movies.controller';
import { MoviesSchedule } from './movies.schedule';
import { MoviesService } from './movies.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesSchedule],
  exports: [MoviesService],
})
export class MoviesModule {}
