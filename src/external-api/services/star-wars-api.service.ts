import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { lastValueFrom } from 'rxjs';

import { SwapiFilm, SwapiFilmsResponse } from '../interfaces/swapi-film.interface';

@Injectable()
export class StarWarsApiService {
  private readonly logger = new Logger(StarWarsApiService.name);
  private readonly baseUrl: string;
  private requestCache: Map<string, any> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('SWAPI_BASE_URL');
  }

  /**
   * Fetch all Star Wars films
   *
   * @return {*}  {Promise<SwapiFilm[]>}
   * @memberof StarWarsApiService
   */
  async getAllFilms(): Promise<SwapiFilm[]> {
    this.logger.log('Fetching all Star Wars films');
    try {
      const response = await this.get<SwapiFilmsResponse>('/films/');
      return response.results;
    } catch (error) {
      this.logger.error(`Failed to fetch Star Wars films: ${error.message}`);
      throw new Error('Failed to fetch Star Wars films');
    }
  }

  /**
   * Fetch resource name from a URL
   *
   * @param {string} url
   * @return {*}  {Promise<string>}
   * @memberof StarWarsApiService
   */
  async getResourceName(url: string): Promise<string> {
    try {
      const resource = await this.get<{ name: string }>(url, true);
      return resource.name;
    } catch (error) {
      this.logger.warn(`Failed to fetch resource ${url}: ${error.message}`);
      return 'Unknown';
    }
  }

  /**
   * Fetch film details with character, planet, starship, vehicle, and species names
   *
   * @param {SwapiFilm} film
   * @return {*}  {Promise<{
   *     film: SwapiFilm;
   *     characterNames: string[];
   *     planetNames: string[];
   *     starshipNames: string[];
   *     vehicleNames: string[];
   *     speciesNames: string[];
   *   }>}
   * @memberof StarWarsApiService
   */
  async getFilmWithDetails(film: SwapiFilm): Promise<{
    film: SwapiFilm;
    characterNames: string[];
    planetNames: string[];
    starshipNames: string[];
    vehicleNames: string[];
    speciesNames: string[];
  }> {
    this.logger.log(`Fetching details for film: ${film.title}`);

    const [characterNames, planetNames, starshipNames, vehicleNames, speciesNames] =
      await Promise.all([
        this.getResourceNames(film.characters),
        this.getResourceNames(film.planets),
        this.getResourceNames(film.starships),
        this.getResourceNames(film.vehicles),
        this.getResourceNames(film.species),
      ]);

    return {
      film,
      characterNames,
      planetNames,
      starshipNames,
      vehicleNames,
      speciesNames,
    };
  }

  /**
   * Fetch resource names from a list of URLs
   *
   * @private
   * @param {string[]} urls
   * @return {*}  {Promise<string[]>}
   * @memberof StarWarsApiService
   */
  private async getResourceNames(urls: string[]): Promise<string[]> {
    const batchSize = 5;
    const results: string[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map((url) => this.getResourceName(url));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * Fetch data from the Star Wars API
   *
   * @private
   * @template T
   * @param {string} endpoint
   * @param {boolean} [isFullUrl=false]
   * @return {*}  {Promise<T>}
   * @memberof StarWarsApiService
   */
  private async get<T>(endpoint: string, isFullUrl = false): Promise<T> {
    const url = isFullUrl ? endpoint : `${this.baseUrl}${endpoint}`;

    if (this.requestCache.has(url)) {
      return this.requestCache.get(url);
    }

    try {
      const response = await lastValueFrom(this.httpService.get<T>(url));
      this.requestCache.set(url, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch data from ${url}: ${error.message}`);
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}
