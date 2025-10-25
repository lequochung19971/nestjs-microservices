export interface JwtTokenInfo {
  sub: string;
  email?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: {
    [key: string]: {
      roles?: string[];
    };
  };
}
