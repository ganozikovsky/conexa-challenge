import { Injectable, ConflictException } from '@nestjs/common';

import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { SignUpDto as UserDto } from 'src/auth/dto/sign-up.dto';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  /**
   * Creates an instance of UsersService.
   * @param {PrismaService} prisma
   * @memberof UsersService
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   *
   * @param {string} email
   * @return {*}  {Promise<Partial<User>>}
   * @memberof UsersService
   */
  async findByEmail(email: string): Promise<Partial<User>> {
    return this.prisma.user.findUnique({
      omit: { password: true },
      where: { email },
    });
  }

  /**
   *
   *
   * @param {number} id
   * @return {*}  {Promise<Partial<User>>}
   * @memberof UsersService
   */
  async findById(id: number): Promise<Partial<User>> {
    return this.prisma.user.findUnique({
      omit: { password: true },
      where: { id },
    });
  }

  /**
   *
   *
   * @param {UserDto} userDto
   * @return {*}  {Promise<Partial<User>>}
   * @memberof UsersService
   */
  async create(userDto: UserDto): Promise<Partial<User>> {
    const existingUser = await this.findByEmail(userDto.email);
    if (existingUser) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(userDto.password, 10);
    const user = await this.prisma.user.create({
      omit: { password: true },
      data: {
        ...userDto,
        password,
      },
    });
    return user;
  }

  /**
   *
   *
   * @param {string} email
   * @param {string} password
   * @return {*}  {(Promise<Partial<User> | null>)}
   * @memberof UsersService
   */
  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
