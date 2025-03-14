import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '../auth/enums/role.enums';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
  };

  const mockToken = 'jwt-token-value';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await authService.signUp(signUpDto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should return user and token when credentials are valid', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await authService.signIn(signInDto);

      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
      expect(usersService.validateUser).toHaveBeenCalledWith(signInDto.email, signInDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.signIn(signInDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('generateToken (private method)', () => {
    it('should generate a JWT token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = (authService as any).generateToken(1, 'test@example.com');

      expect(result).toEqual(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
    });
  });
});
