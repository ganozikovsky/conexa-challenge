import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User as UserModel } from '@prisma/client';

import { ApiCrud, ApiCrudAction } from '../common/decorators/api-crud.decorator';
import { AuthResponse, UserResponse } from '../common/schemas/api-responses.schema';

import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt/jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   *
   * @param {SignUpDto} signUpDto
   * @return {*}  {Promise<Partial<UserModel>>}
   * @memberof AuthController
   */
  @Post('sign-up')
  @ApiCrud('User', ApiCrudAction.CREATE, UserResponse)
  signUp(@Body() signUpDto: SignUpDto): Promise<Partial<UserModel>> {
    return this.authService.signUp(signUpDto);
  }

  /**
   * User login
   *
   * @param {SignInDto} signInDto
   * @return {*}  {Promise<{ user: Partial<UserModel>; token: string }>}
   * @memberof AuthController
   */
  @Post('sign-in')
  @ApiCrud('User', ApiCrudAction.CREATE, AuthResponse)
  signIn(@Body() signInDto: SignInDto): Promise<{ user: Partial<UserModel>; token: string }> {
    return this.authService.signIn(signInDto);
  }

  /**
   * Get current user profile
   *
   * @param {*} user
   * @return {*}  {Partial<UserModel>}
   * @memberof AuthController
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiCrud('User', ApiCrudAction.READ_ONE, UserResponse)
  getProfile(@User() user): Partial<UserModel> {
    return user;
  }
}
