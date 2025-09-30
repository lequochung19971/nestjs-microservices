/**
 * Common parameters for Keycloak /protocol/openid-connect/token requests.
 */
export interface KeycloakTokenRequestBase {
  /**
   * OAuth 2.0 grant type.
   * Common values: 'authorization_code', 'refresh_token', 'password', 'client_credentials', 'urn:ietf:params:oauth:grant-type:uma-ticket'
   */
  grant_type: string;
  /**
   * The client ID of your application registered in Keycloak.
   */
  client_id: string;
  /**
   * The client secret of your application (if it's a confidential client).
   */
  client_secret?: string;
  /**
   * Space-separated list of scopes requested by the client.
   * Common scopes include 'openid', 'profile', 'email', 'offline_access'.
   */
  scope?: string;
}

/**
 * Parameters for the 'authorization_code' grant type.
 */
export interface KeycloakAuthorizationCodeTokenRequest
  extends KeycloakTokenRequestBase {
  grant_type: 'authorization_code';
  /**
   * The authorization code received from the /protocol/openid-connect/auth endpoint.
   */
  code: string;
  /**
   * The redirect URI that was used in the initial authorization request.
   */
  redirect_uri: string;
  /**
   * (Optional) The PKCE code verifier if PKCE was used in the authorization request.
   */
  code_verifier?: string;
}

/**
 * Parameters for the 'refresh_token' grant type.
 */
export interface KeycloakRefreshTokenRequest extends KeycloakTokenRequestBase {
  grant_type: 'refresh_token';
  /**
   * The refresh token obtained from a previous token request.
   */
  refresh_token: string;
}

/**
 * Parameters for the 'password' grant type (Resource Owner Password Credentials).
 * Note: This grant type is generally discouraged for public clients due to security concerns.
 */
export interface KeycloakPasswordTokenRequest extends KeycloakTokenRequestBase {
  grant_type: 'password';
  /**
   * The username of the resource owner.
   */
  username: string;
  /**
   * The password of the resource owner.
   */
  password: string;
}

/**
 * Parameters for the 'client_credentials' grant type.
 */
export interface KeycloakClientCredentialsTokenRequest
  extends KeycloakTokenRequestBase {
  grant_type: 'client_credentials';
  // client_id and client_secret are already in KeycloakTokenRequestBase
}

/**
 * Combined type for all possible token request parameters.
 */
export type KeycloakTokenRequest =
  | KeycloakAuthorizationCodeTokenRequest
  | KeycloakRefreshTokenRequest
  | KeycloakPasswordTokenRequest
  | KeycloakClientCredentialsTokenRequest;
// Add other grant types like 'urn:ietf:params:oauth:grant-type:uma-ticket' if needed.

/**
 * Expected response structure from the Keycloak /protocol/openid-connect/token endpoint.
 */
export interface KeycloakTokenResponse {
  /**
   * The access token (JWT). This is used to access protected resources.
   */
  access_token: string;
  /**
   * The lifetime in seconds of the access token.
   */
  expires_in: number;
  /**
   * The lifetime in seconds of the refresh token.
   */
  refresh_expires_in: number;
  /**
   * The refresh token. This can be used to obtain new access tokens without re-authenticating.
   */
  refresh_token: string;
  /**
   * The type of token issued. Typically 'Bearer'.
   */
  token_type: 'Bearer';
  /**
   * The ID token (JWT). This contains claims about the authenticated user.
   * Present only if the 'openid' scope was requested.
   */
  id_token?: string;
  /**
   * Space-separated list of scopes granted to the client.
   */
  scope: string;
  /**
   * A session state value, often used for session management (e.g., in an iframe for session checks).
   */
  session_state: string;
  /**
   * (Optional) The not-before-policy value in seconds.
   */
  'not-before-policy'?: number;
}

/**
 * Error response from the Keycloak /protocol/openid-connect/token endpoint.
 */
export interface KeycloakTokenErrorResponse {
  /**
   * A single ASCII error code.
   */
  error: string;
  /**
   * A human-readable ASCII text providing additional information.
   */
  error_description?: string;
}
