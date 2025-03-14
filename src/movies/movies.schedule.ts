import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MoviesService } from './movies.service';

@Injectable()
export class MoviesSchedule {
  private readonly logger = new Logger(MoviesSchedule.name);

  constructor(private readonly moviesService: MoviesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSyncStarWarsMovies() {
    this.logger.log('Starting scheduled sync of Star Wars movies');
    try {
      await this.moviesService.syncWithStarWarsApi();
      this.logger.log('Successfully synced Star Wars movies');
    } catch (error) {
      this.logger.error(`Failed to sync Star Wars movies: ${error.message}`);
    }
  }
}
