import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Movie } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { PrismaService } from '../database/prisma.service';
import { SwapiFilm } from '../external-api/interfaces/swapi-film.interface';
import { StarWarsApiService } from '../external-api/services/star-wars-api.service';

import { CreateMovieDto } from './dto/create-movie.dto';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let prismaService: DeepMockProxy<PrismaService>;
  let starWarsApiService: DeepMockProxy<StarWarsApiService>;

  const mockMovie = {
    id: 1,
    title: 'A New Hope',
    episodeId: 4,
    openingCrawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    releaseDate: new Date('1977-05-25'),
    characterNames: ['Luke Skywalker', 'Darth Vader'],
    planetNames: ['Tatooine', 'Alderaan'],
    starshipNames: ['Death Star', 'Millennium Falcon'],
    vehicleNames: ['X-wing', 'TIE Fighter'],
    speciesNames: ['Human', 'Droid'],
    externalId: 'https://swapi.dev/api/films/1/',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Movie;

  const mockSwApiFilm: SwapiFilm = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: StarWarsApiService,
          useValue: mockDeep<StarWarsApiService>(),
        },
      ],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    prismaService = module.get(PrismaService) as DeepMockProxy<PrismaService>;
    starWarsApiService = module.get(StarWarsApiService) as DeepMockProxy<StarWarsApiService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies excluding detailed names', async () => {
      prismaService.movie.findMany.mockResolvedValue([mockMovie]);

      const result = await moviesService.findAll();

      expect(result).toEqual([mockMovie]);
      expect(prismaService.movie.findMany).toHaveBeenCalledWith({
        omit: {
          characterNames: true,
          planetNames: true,
          starshipNames: true,
          vehicleNames: true,
          speciesNames: true,
        },
      });
    });

    it('should return empty array when no movies are found', async () => {
      prismaService.movie.findMany.mockResolvedValue([]);

      const result = await moviesService.findAll();

      expect(result).toEqual([]);
      expect(prismaService.movie.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single movie when found', async () => {
      prismaService.movie.findUnique.mockResolvedValue(mockMovie);

      const result = await moviesService.findOne(1);

      expect(result).toEqual(mockMovie);
      expect(prismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when movie is not found', async () => {
      prismaService.movie.findUnique.mockResolvedValue(null);

      await expect(moviesService.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(moviesService.findOne(999)).rejects.toThrow('Movie with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'A New Hope',
        episodeId: 4,
        openingCrawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        releaseDate: new Date('1977-05-25'),
        externalId: 'https://swapi.dev/api/films/1/',
      };

      prismaService.movie.create.mockResolvedValue(mockMovie);

      const result = await moviesService.create(createMovieDto);

      expect(result).toEqual(mockMovie);
      expect(prismaService.movie.create).toHaveBeenCalledWith({
        data: createMovieDto,
      });
    });
  });

  describe('update', () => {
    it('should update and return a movie', async () => {
      const updateMovieDto = {
        director: 'Updated Director',
      };

      const updatedMockMovie = { ...mockMovie, director: 'Updated Director' };

      prismaService.movie.findUnique.mockResolvedValue(mockMovie);
      prismaService.movie.update.mockResolvedValue(updatedMockMovie);

      const result = await moviesService.update(1, updateMovieDto);

      expect(result.director).toEqual('Updated Director');
      expect(prismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateMovieDto,
      });
    });

    it('should throw NotFoundException when movie to update is not found', async () => {
      prismaService.movie.findUnique.mockResolvedValue(null);

      await expect(moviesService.update(999, {})).rejects.toThrow(NotFoundException);
      await expect(moviesService.update(999, {})).rejects.toThrow('Movie with ID 999 not found');
    });
  });

  describe('remove', () => {
    it('should delete and return a movie', async () => {
      prismaService.movie.findUnique.mockResolvedValue(mockMovie);
      prismaService.movie.delete.mockResolvedValue(mockMovie);

      const result = await moviesService.remove(1);

      expect(result).toEqual(mockMovie);
      expect(prismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when movie to remove is not found', async () => {
      prismaService.movie.findUnique.mockResolvedValue(null);

      await expect(moviesService.remove(999)).rejects.toThrow(NotFoundException);
      await expect(moviesService.remove(999)).rejects.toThrow('Movie with ID 999 not found');
    });
  });

  describe('syncWithStarWarsApi', () => {
    it('should sync new films from Star Wars API', async () => {
      starWarsApiService.getAllFilms.mockResolvedValue([mockSwApiFilm]);
      prismaService.movie.findMany.mockResolvedValue([]);

      starWarsApiService.getFilmWithDetails.mockResolvedValue({
        film: mockSwApiFilm,
        characterNames: ['Luke Skywalker'],
        planetNames: ['Tatooine'],
        starshipNames: ['Death Star'],
        vehicleNames: ['X-wing'],
        speciesNames: ['Human'],
      });

      await moviesService.syncWithStarWarsApi();

      expect(starWarsApiService.getAllFilms).toHaveBeenCalled();
      expect(starWarsApiService.getFilmWithDetails).toHaveBeenCalledWith(mockSwApiFilm);
      expect(prismaService.movie.createMany).toHaveBeenCalled();
    });

    it('should not create movies if all films already exist', async () => {
      starWarsApiService.getAllFilms.mockResolvedValue([mockSwApiFilm]);
      prismaService.movie.findMany.mockResolvedValue([{ externalId: mockSwApiFilm.url } as any]);

      await moviesService.syncWithStarWarsApi();

      expect(starWarsApiService.getAllFilms).toHaveBeenCalled();
      expect(prismaService.movie.createMany).not.toHaveBeenCalled();
    });

    it('should throw error when API synchronization fails', async () => {
      starWarsApiService.getAllFilms.mockRejectedValue(new Error('API error'));

      await expect(moviesService.syncWithStarWarsApi()).rejects.toThrow(
        'Failed to sync with Star Wars API: API error',
      );
    });
  });

  describe('private methods', () => {
    describe('filterNewFilms', () => {
      it('should filter out films that already exist in the database', async () => {
        const films = [mockSwApiFilm, { ...mockSwApiFilm, url: 'https://swapi.dev/api/films/2/' }];
        prismaService.movie.findMany.mockResolvedValue([
          { externalId: 'https://swapi.dev/api/films/1/' } as any,
        ]);

        const result = await (moviesService as any).filterNewFilms(films);

        expect(result.length).toBe(1);
        expect(result[0].url).toBe('https://swapi.dev/api/films/2/');
      });
    });

    describe('prepareMoviesForCreation', () => {
      it('should prepare films data for database insertion', async () => {
        starWarsApiService.getFilmWithDetails.mockResolvedValue({
          film: mockSwApiFilm,
          characterNames: ['Luke Skywalker'],
          planetNames: ['Tatooine'],
          starshipNames: ['Death Star'],
          vehicleNames: ['X-wing'],
          speciesNames: ['Human'],
        });

        const result = await (moviesService as any).prepareMoviesForCreation([mockSwApiFilm]);

        expect(result.length).toBe(1);
        expect(result[0]).toMatchObject({
          title: mockSwApiFilm.title,
          episodeId: mockSwApiFilm.episode_id,
          externalId: mockSwApiFilm.url,
        });
        expect(result[0].characterNames).toEqual(['Luke Skywalker']);
      });
    });

    describe('saveMoviesToDatabase', () => {
      it('should save prepared movies to database', async () => {
        const moviesToCreate = [
          {
            title: 'Test Movie',
            episodeId: 1,
            externalId: 'test-url',
          },
        ];

        await (moviesService as any).saveMoviesToDatabase(moviesToCreate);

        expect(prismaService.movie.createMany).toHaveBeenCalledWith({
          data: moviesToCreate,
          skipDuplicates: true,
        });
      });

      it('should not call createMany when movies array is empty', async () => {
        await (moviesService as any).saveMoviesToDatabase([]);

        expect(prismaService.movie.createMany).not.toHaveBeenCalled();
      });
    });
  });
});
