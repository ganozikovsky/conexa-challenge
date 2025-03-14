import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../users/users.service';
import { Role } from '../enums/role.enums';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user object when JWT payload is valid', async () => {
      const payload = { sub: 1, email: 'test@example.com' };
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw an UnauthorizedException when user is not found', async () => {
      const payload = { sub: 999, email: 'nonexistent@example.com' };
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
