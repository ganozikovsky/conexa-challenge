import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Movie } from '@prisma/client';
import * as _ from 'lodash';

import { SwapiFilm } from 'src/external-api/interfaces/swapi-film.interface';

import { PrismaService } from '../database/prisma.service';
import { StarWarsApiService } from '../external-api/services/star-wars-api.service';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly starWarsApiService: StarWarsApiService,
  ) {}

  /**
   *
   *
   * @return {*}  {Promise<Partial<Movie>[]>}
   * @memberof MoviesService
   */
  async findAll(): Promise<Partial<Movie>[]> {
    return this.prisma.movie.findMany({
      omit: {
        characterNames: true,
        planetNames: true,
        starshipNames: true,
        vehicleNames: true,
        speciesNames: true,
      },
    });
  }

  /**
   *
   *
   * @param {number} id
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesService
   */
  async findOne(id: number): Promise<Movie> {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });
    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found`);

    return movie;
  }

  /**
   *
   *
   * @param {CreateMovieDto} createMovieDto
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesService
   */
  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.prisma.movie.create({
      data: createMovieDto,
    });
  }

  /**
   *
   *
   * @param {number} id
   * @param {UpdateMovieDto} updateMovieDto
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesService
   */
  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    await this.findOne(id);
    return this.prisma.movie.update({
      where: { id },
      data: updateMovieDto,
    });
  }

  /**
   *
   *
   * @param {number} id
   * @return {*}  {Promise<Movie>}
   * @memberof MoviesService
   */
  async remove(id: number): Promise<Movie> {
    await this.findOne(id);
    return this.prisma.movie.delete({
      where: { id },
    });
  }

  /**
   * Synchronize the database with the Star Wars API
   *
   * @return {*}  {Promise<void>}
   * @memberof MoviesService
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncWithStarWarsApi(): Promise<void> {
    this.logger.log('Starting synchronization with Star Wars API');

    try {
      const films = await this.starWarsApiService.getAllFilms();
      const newFilms = await this.filterNewFilms(films);

      if (_.isEmpty(newFilms)) {
        this.logger.log('No new movies to sync. All movies already exist in database.');
        return;
      }

      this.logger.log(`Found ${newFilms.length} new movies to add to the database`);

      const moviesToCreate = await this.prepareMoviesForCreation(newFilms);
      await this.saveMoviesToDatabase(moviesToCreate);

      this.logger.log('Synchronization with Star Wars API completed successfully');
    } catch (error) {
      this.logger.error(`Synchronization failed: ${error.message}`);
      throw new Error(`Failed to sync with Star Wars API: ${error.message}`);
    }
  }

  /**
   * Filter out films that are already in the database
   *
   * @private
   * @param {SwapiFilm[]} films
   * @return {*}  {Promise<SwapiFilm[]>}
   * @memberof MoviesService
   */
  private async filterNewFilms(films: SwapiFilm[]): Promise<SwapiFilm[]> {
    const existingMoviesExternalIds = await this.prisma.movie.findMany({
      select: {
        externalId: true,
      },
    });

    const existingExternalIdsSet = new Set(
      existingMoviesExternalIds.map((movie) => movie.externalId),
    );

    return films.filter((film) => !existingExternalIdsSet.has(film.url));
  }

  /**
   * Prepare movies for creation in the database
   *
   * @private
   * @param {SwapiFilm[]} films
   * @return {*}  {Promise<any[]>}
   * @memberof MoviesService
   */
  private async prepareMoviesForCreation(films: SwapiFilm[]): Promise<any[]> {
    const moviesToCreate: any[] = [];

    for (const film of films) {
      this.logger.log(`Processing new film: ${film.title}`);

      const { characterNames, planetNames, starshipNames, vehicleNames, speciesNames } =
        await this.starWarsApiService.getFilmWithDetails(film);

      moviesToCreate.push({
        title: film.title,
        episodeId: film.episode_id,
        openingCrawl: film.opening_crawl,
        director: film.director,
        producer: film.producer,
        releaseDate: new Date(film.release_date),
        characterNames,
        planetNames,
        starshipNames,
        vehicleNames,
        speciesNames,
        externalId: film.url,
      });
    }

    return moviesToCreate;
  }

  /**
   * Save movies to the database
   *
   * @private
   * @param {any[]} movies
   * @return {*}  {Promise<void>}
   * @memberof MoviesService
   */
  private async saveMoviesToDatabase(movies: any[]): Promise<void> {
    if (movies.length > 0) {
      this.logger.log(`Creating ${movies.length} new movies`);
      await this.prisma.movie.createMany({
        data: movies,
        skipDuplicates: true,
      });
    }
  }
}
