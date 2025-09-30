export interface JwksConfig {
  jwksUrl: string;
  issuer?: string;
  audience?: string;
  algorithms?: string[];
  maxTokenAge?: number;
  currentDate?: Date;
}

export interface JwksModuleConfig {
  jwks: JwksConfig;
}
