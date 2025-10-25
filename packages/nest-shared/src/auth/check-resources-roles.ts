import { JwtTokenInfo } from '../types';
import { RolesMetadata } from './roles.decorator';

export const checkResourcesRoles = (
  jwtTokenInfo: JwtTokenInfo,
  args: RolesMetadata[],
) => {
  return args.some((arg) =>
    jwtTokenInfo.resource_access[arg.resource]?.roles?.some((role) =>
      arg.roles.includes(role),
    ),
  );
};
