import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../auth/enums/role.enums';

export class UserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AuthResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;
}

export class MovieResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'A New Hope' })
  title: string;

  @ApiProperty({ example: 4 })
  episodeId: number;

  @ApiProperty({ example: 'It is a period of civil war...' })
  openingCrawl: string;

  @ApiProperty({ example: 'George Lucas' })
  director: string;

  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum' })
  producer: string;

  @ApiProperty()
  releaseDate: Date;

  @ApiProperty({ type: [String], example: ['Luke Skywalker', 'Darth Vader'] })
  characterNames: string[];

  @ApiProperty({ type: [String], example: ['Tatooine', 'Alderaan'] })
  planetNames: string[];

  @ApiProperty({ type: [String], example: ['Death Star', 'X-wing'] })
  starshipNames: string[];

  @ApiProperty({ type: [String], example: ['Sand Crawler', 'TIE Fighter'] })
  vehicleNames: string[];

  @ApiProperty({ type: [String], example: ['Human', 'Droid'] })
  speciesNames: string[];

  @ApiProperty({ example: 'https://swapi.dev/api/films/1/' })
  externalId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
