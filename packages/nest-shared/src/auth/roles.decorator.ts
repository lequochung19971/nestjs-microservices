import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export interface RolesMetadata {
  resource: string;
  roles: string[];
}
export const Roles = (args: RolesMetadata | RolesMetadata[]) =>
  SetMetadata<string, RolesMetadata[]>(
    ROLES_KEY,
    Array.isArray(args) ? args : [args],
  );
