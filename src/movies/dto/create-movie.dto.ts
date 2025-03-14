import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Movie title',
    example: 'A New Hope',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Episode ID number',
    example: 4,
  })
  @IsNumber()
  @Min(1)
  episodeId: number;

  @ApiProperty({
    description: 'Opening crawl text',
    example: 'It is a period of civil war...',
  })
  @IsString()
  openingCrawl: string;

  @ApiProperty({
    description: 'Movie director',
    example: 'George Lucas',
  })
  @IsString()
  director: string;

  @ApiProperty({
    description: 'Movie producer',
    example: 'Gary Kurtz, Rick McCallum',
  })
  @IsString()
  producer: string;

  @ApiProperty({
    description: 'Release date',
    example: '1977-05-25',
  })
  @IsDateString()
  releaseDate: Date;

  @ApiPropertyOptional({
    description: 'List of character names',
    example: ['Luke Skywalker', 'Darth Vader'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  characterNames?: string[];

  @ApiPropertyOptional({
    description: 'List of planet names',
    example: ['Tatooine', 'Alderaan'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  planetNames?: string[];

  @ApiPropertyOptional({
    description: 'List of starship names',
    example: ['Death Star', 'X-wing'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  starshipNames?: string[];

  @ApiPropertyOptional({
    description: 'List of vehicle names',
    example: ['Sand Crawler', 'TIE Fighter'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  vehicleNames?: string[];

  @ApiPropertyOptional({
    description: 'List of species names',
    example: ['Human', 'Droid'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  speciesNames?: string[];

  @ApiProperty({
    description: 'External API ID reference',
    example: 'https://swapi.dev/api/films/1/',
  })
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  externalId: string;
}
