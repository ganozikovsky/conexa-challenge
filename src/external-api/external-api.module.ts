import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StarWarsApiService } from './services/star-wars-api.service';

@Module({
  imports: [HttpModule],
  providers: [StarWarsApiService],
  exports: [StarWarsApiService],
})
export class ExternalApiModule {}
