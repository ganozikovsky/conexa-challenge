import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SwaggerMessages } from '../constants/swagger.constants';

export enum ApiCrudAction {
  CREATE = 'create',
  READ = 'read',
  READ_ONE = 'readOne',
  UPDATE = 'update',
  DELETE = 'delete',
  SYNC = 'sync',
}

export function ApiCrud(entity: string, action: ApiCrudAction, responseType?: any) {
  const decorators = [];

  switch (action) {
    case ApiCrudAction.CREATE:
      decorators.push(
        ApiOperation({ summary: `Create a new ${entity}` }),
        ApiResponse({
          status: 201,
          description: SwaggerMessages.createSuccess(entity),
          type: responseType,
        }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
        ApiResponse({ status: 403, description: SwaggerMessages.forbidden }),
      );
      break;

    case ApiCrudAction.READ:
      decorators.push(
        ApiOperation({ summary: `Get all ${entity}s` }),
        ApiResponse({ status: 200, description: SwaggerMessages.list(entity), type: responseType }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
      );
      break;

    case ApiCrudAction.READ_ONE:
      decorators.push(
        ApiOperation({ summary: `Get a specific ${entity} by ID` }),
        ApiResponse({
          status: 200,
          description: SwaggerMessages.detail(entity),
          type: responseType,
        }),
        ApiResponse({ status: 404, description: SwaggerMessages.notFound(entity) }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
      );
      break;

    case ApiCrudAction.UPDATE:
      decorators.push(
        ApiOperation({ summary: `Update a ${entity}` }),
        ApiResponse({
          status: 200,
          description: SwaggerMessages.updateSuccess(entity),
          type: responseType,
        }),
        ApiResponse({ status: 404, description: SwaggerMessages.notFound(entity) }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
        ApiResponse({ status: 403, description: SwaggerMessages.forbidden }),
      );
      break;

    case ApiCrudAction.DELETE:
      decorators.push(
        ApiOperation({ summary: `Delete a ${entity}` }),
        ApiResponse({
          status: 200,
          description: SwaggerMessages.deleteSuccess(entity),
          type: responseType,
        }),
        ApiResponse({ status: 404, description: SwaggerMessages.notFound(entity) }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
        ApiResponse({ status: 403, description: SwaggerMessages.forbidden }),
      );
      break;

    case ApiCrudAction.SYNC:
      decorators.push(
        ApiOperation({ summary: `Sync ${entity}s with external API` }),
        ApiResponse({ status: 200, description: SwaggerMessages.syncSuccess(entity) }),
        ApiResponse({ status: 401, description: SwaggerMessages.unauthorized }),
        ApiResponse({ status: 403, description: SwaggerMessages.forbidden }),
      );
      break;
  }

  return applyDecorators(...decorators);
}
