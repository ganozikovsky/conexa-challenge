import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { SignUpDto } from '../auth/dto/sign-up.dto';
import { Role } from '../auth/enums/role.enums';
import { PrismaService } from '../database/prisma.service';

import { UsersService } from './users.service';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: DeepMockProxy<PrismaService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockUserWithoutPassword = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService) as DeepMockProxy<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user without password when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithoutPassword as any);

      const result = await usersService.findByEmail('test@example.com');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        omit: { password: true },
      });
    });

    it('should return null when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user without password when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithoutPassword as any);

      const result = await usersService.findById(1);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
      });
    });

    it('should return null when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const signUpDto: SignUpDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        ...mockUserWithoutPassword,
        email: signUpDto.email,
        name: signUpDto.name,
      } as User);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await usersService.create(signUpDto);

      expect(result).toEqual({
        ...mockUserWithoutPassword,
        email: signUpDto.email,
        name: signUpDto.name,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          password: 'hashed_password',
          name: signUpDto.name,
        },
        omit: {
          password: true,
        },
      });
    });

    it('should throw a ConflictException if email already exists', async () => {
      const signUpDto: SignUpDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      prismaService.user.findUnique.mockResolvedValue({ id: 2 } as User);

      await expect(usersService.create(signUpDto)).rejects.toThrow(ConflictException);
      await expect(usersService.create(signUpDto)).rejects.toThrow('Email already in use');
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await usersService.validateUser('test@example.com', 'correct_password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', mockUser.password);
    });

    it('should return null if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.validateUser('nonexistent@example.com', 'any_password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await usersService.validateUser('test@example.com', 'wrong_password');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', mockUser.password);
    });
  });
});
