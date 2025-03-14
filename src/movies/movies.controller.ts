import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Movie } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enums';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { ApiCrud, ApiCrudAction } from '../common/decorators/api-crud.decorator';
import { MovieResponse } from '../common/schemas/api-responses.schema';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  /**
   * Get all movies
   *
   * @return {*}  {Promise<Partial<Movie>[]>}
   * @memberof MoviesController
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.READ, [MovieResponse])
  findAll(): Promise<Partial<Movie>[]> {
    return this.moviesService.findAll();
  }

  /**
   * Get a specific movie by ID
   *
   * @param {number} id
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesController
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.READ_ONE, MovieResponse)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  /**
   * Create a new movie
   *
   * @param {CreateMovieDto} createMovieDto
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesController
   */
  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.CREATE, MovieResponse)
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  /**
   * Update a movie
   *
   * @param {number} id
   * @param {UpdateMovieDto} updateMovieDto
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesController
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.UPDATE, MovieResponse)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, updateMovieDto);
  }

  /**
   * Delete a movie
   *
   * @param {number} id
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesController
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.DELETE, MovieResponse)
  remove(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.moviesService.remove(id);
  }

  /**
   * Sync movies with Star Wars API
   *
   * @return {*}  {Promise<void>}
   * @memberof MoviesController
   */
  @Post('sync')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCrud('Movie', ApiCrudAction.SYNC)
  syncWithStarWarsApi(): Promise<void> {
    return this.moviesService.syncWithStarWarsApi();
  }
}
