import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '@prisma/client';

import { UsersService } from 'src/users/users.service';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   *
   * @param {SignUpDto} signUpDto
   * @return {*}  {Promise<Partial<User>>}
   * @memberof AuthService
   */
  async signUp(signUpDto: SignUpDto): Promise<Partial<User>> {
    return this.usersService.create(signUpDto);
  }

  /**
   *
   *
   * @param {SignInDto} signInDto
   * @return {*}  {Promise<{ user: Partial<User>; token: string }>}
   * @memberof AuthService
   */
  async signIn(signInDto: SignInDto): Promise<{ user: Partial<User>; token: string }> {
    const { email, password } = signInDto;

    const user = await this.usersService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  /**
   *
   *
   * @private
   * @param {number} userId
   * @param {string} email
   * @return {*}  {string}
   * @memberof AuthService
   */
  private generateToken(userId: number, email: string): string {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwtService.sign(payload);
  }
}
