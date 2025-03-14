import { CallHandler, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { of } from 'rxjs';

import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();

    interceptor = moduleRef.get<ResponseInterceptor<any>>(ResponseInterceptor);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          statusCode: HttpStatus.OK,
        }),
        getRequest: jest.fn(),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform the response to match ApiResponse format', (done) => {
    const responseData = { id: 1, name: 'Test' };
    const mockedDate = new Date('2023-01-01T12:00:00Z');

    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate as any);
    jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(responseData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({
          statusCode: HttpStatus.OK,
          message: 'success',
          data: responseData,
          timestamp: mockedDate.toISOString(),
        });
      },
      complete: () => done(),
    });

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should use status code from response object', (done) => {
    const responseData = { message: 'Created' };
    const customStatusCode = HttpStatus.CREATED;

    jest.spyOn(mockExecutionContext.switchToHttp(), 'getResponse').mockReturnValue({
      statusCode: customStatusCode,
    });
    jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(responseData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.statusCode).toEqual(customStatusCode);
      },
      complete: () => done(),
    });
  });

  it('should handle empty response data', (done) => {
    jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(null));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.data).toBeNull();
        expect(value.statusCode).toEqual(HttpStatus.OK);
        expect(value.message).toEqual('success');
      },
      complete: () => done(),
    });
  });
});
