export const SwaggerMessages = {
  createSuccess: (entity: string) => `${entity} created successfully`,
  updateSuccess: (entity: string) => `${entity} updated successfully`,
  deleteSuccess: (entity: string) => `${entity} deleted successfully`,
  notFound: (entity: string) => `${entity} not found`,
  list: (entity: string) => `List of all ${entity}s`,
  detail: (entity: string) => `${entity} details`,
  syncSuccess: (entity: string) => `${entity} sync completed successfully`,
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden - Admin access required',
};
