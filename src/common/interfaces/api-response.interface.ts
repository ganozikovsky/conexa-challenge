import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2023-05-10T15:30:45.123Z' })
  timestamp: string;
}
