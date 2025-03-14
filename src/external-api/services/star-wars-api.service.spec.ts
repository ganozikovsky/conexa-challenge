import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

import { SwapiFilm, SwapiFilmsResponse } from '../interfaces/swapi-film.interface';

import { StarWarsApiService } from './star-wars-api.service';

describe('StarWarsApiService', () => {
  let service: StarWarsApiService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockApiBaseUrl = 'https://swapi.dev/api';

  const mockFilm: SwapiFilm = {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: ['https://swapi.dev/api/people/1/'],
    planets: ['https://swapi.dev/api/planets/1/'],
    starships: ['https://swapi.dev/api/starships/1/'],
    vehicles: ['https://swapi.dev/api/vehicles/1/'],
    species: ['https://swapi.dev/api/species/1/'],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: 'https://swapi.dev/api/films/1/',
  };

  const createAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { url: 'test-url' } as any,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarWarsApiService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockApiBaseUrl),
          },
        },
      ],
    }).compile();

    service = module.get<StarWarsApiService>(StarWarsApiService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFilms', () => {
    it('should return all Star Wars films', async () => {
      const mockFilmsResponse: SwapiFilmsResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockFilm],
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(createAxiosResponse(mockFilmsResponse)));

      const result = await service.getAllFilms();

      expect(result).toEqual([mockFilm]);
      expect(httpService.get).toHaveBeenCalledWith(`${mockApiBaseUrl}/films/`);
    });

    it('should throw an error when API call fails', async () => {
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('API error');
      });

      await expect(service.getAllFilms()).rejects.toThrow('Failed to fetch Star Wars films');
    });

    it('should use cached results on subsequent calls', async () => {
      const mockFilmsResponse: SwapiFilmsResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockFilm],
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(createAxiosResponse(mockFilmsResponse)));

      await service.getAllFilms();

      await service.getAllFilms();

      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getResourceName', () => {
    it('should return name of a resource', async () => {
      const mockResource = { name: 'Luke Skywalker' };
      const resourceUrl = 'https://swapi.dev/api/people/1/';

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(createAxiosResponse(mockResource)));

      const result = await service.getResourceName(resourceUrl);

      expect(result).toEqual('Luke Skywalker');
      expect(httpService.get).toHaveBeenCalledWith(resourceUrl);
    });

    it('should return "Unknown" when resource fetch fails', async () => {
      const resourceUrl = 'https://swapi.dev/api/people/999/';

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('Resource not found');
      });

      const result = await service.getResourceName(resourceUrl);

      expect(result).toEqual('Unknown');
    });

    it('should use cache for previously fetched resources', async () => {
      const mockResource = { name: 'Luke Skywalker' };
      const resourceUrl = 'https://swapi.dev/api/people/1/';

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(createAxiosResponse(mockResource)));

      await service.getResourceName(resourceUrl);

      await service.getResourceName(resourceUrl);

      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFilmWithDetails', () => {
    it('should fetch film details with all related resources', async () => {
      jest.spyOn(service as any, 'getResourceNames').mockImplementation((urls) => {
        if (urls === mockFilm.characters) return Promise.resolve(['Luke Skywalker']);
        if (urls === mockFilm.planets) return Promise.resolve(['Tatooine']);
        if (urls === mockFilm.starships) return Promise.resolve(['Death Star']);
        if (urls === mockFilm.vehicles) return Promise.resolve(['X-wing']);
        if (urls === mockFilm.species) return Promise.resolve(['Human']);
        return Promise.resolve([]);
      });

      const result = await service.getFilmWithDetails(mockFilm);

      expect(result).toEqual({
        film: mockFilm,
        characterNames: ['Luke Skywalker'],
        planetNames: ['Tatooine'],
        starshipNames: ['Death Star'],
        vehicleNames: ['X-wing'],
        speciesNames: ['Human'],
      });

      expect((service as any).getResourceNames).toHaveBeenCalledTimes(5);
    });
  });

  describe('private methods', () => {
    describe('getResourceNames', () => {
      it('should fetch names for a batch of URLs', async () => {
        const urls = [
          'https://swapi.dev/api/people/1/',
          'https://swapi.dev/api/people/2/',
          'https://swapi.dev/api/people/3/',
        ];

        jest.spyOn(service, 'getResourceName').mockImplementation((url) => {
          if (url === urls[0]) return Promise.resolve('Luke Skywalker');
          if (url === urls[1]) return Promise.resolve('C-3PO');
          if (url === urls[2]) return Promise.resolve('R2-D2');
          return Promise.resolve('Unknown');
        });

        const result = await (service as any).getResourceNames(urls);

        expect(result).toEqual(['Luke Skywalker', 'C-3PO', 'R2-D2']);
        expect(service.getResourceName).toHaveBeenCalledTimes(3);
      });

      it('should handle empty URL array', async () => {
        const result = await (service as any).getResourceNames([]);
        expect(result).toEqual([]);
      });

      it('should process URLs in batches', async () => {
        const urls = Array(12)
          .fill('')
          .map((_, i) => `https://swapi.dev/api/people/${i + 1}/`);

        jest.spyOn(service, 'getResourceName').mockResolvedValue('Character');
        jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
          cb();
          return {} as any;
        });

        await (service as any).getResourceNames(urls);

        expect(setTimeout).toHaveBeenCalledTimes(2);
      });
    });

    describe('get', () => {
      it('should fetch data from API', async () => {
        const endpoint = '/test/';
        const mockData = { test: 'data' };

        jest.spyOn(httpService, 'get').mockReturnValueOnce(of(createAxiosResponse(mockData)));

        const result = await (service as any).get(endpoint);

        expect(result).toEqual(mockData);
        expect(httpService.get).toHaveBeenCalledWith(`${mockApiBaseUrl}${endpoint}`);
      });

      it('should use full URL when isFullUrl is true', async () => {
        const fullUrl = 'https://some-other-api.com/data';
        const mockData = { test: 'data' };

        jest.spyOn(httpService, 'get').mockReturnValueOnce(of(createAxiosResponse(mockData)));

        const result = await (service as any).get(fullUrl, true);

        expect(result).toEqual(mockData);
        expect(httpService.get).toHaveBeenCalledWith(fullUrl);
      });

      it('should throw an error when API request fails', async () => {
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
          throw new Error('Network error');
        });

        await expect((service as any).get('/test/')).rejects.toThrow(
          'API request failed: Network error',
        );
      });

      it('should cache responses', async () => {
        const endpoint = '/test/';
        const mockData = { test: 'data' };

        jest.spyOn(httpService, 'get').mockReturnValueOnce(of(createAxiosResponse(mockData)));

        await (service as any).get(endpoint);

        const result = await (service as any).get(endpoint);

        expect(result).toEqual(mockData);
        expect(httpService.get).toHaveBeenCalledTimes(1);
      });
    });
  });
});
