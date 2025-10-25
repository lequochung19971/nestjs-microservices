import { Request } from 'express';

/**
 * Headers that should be forwarded to microservices
 */
const FORWARD_HEADERS = [
  'authorization',
  'user-agent',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-real-ip',
  'x-request-id',
  'x-trace-id',
  'x-correlation-id',
] as const;

/**
 * Headers that should NOT be forwarded to prevent security issues
 */
const BLOCKED_HEADERS = [
  'cookie',
  'set-cookie',
  'host',
  'origin',
  'referer',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-ch-ua-platform',
  'sec-ch-prefers-color-scheme',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-dest',
  'dnt',
  'connection',
] as const;

/**
 * Extract necessary headers from the incoming request to forward to microservices
 * @param headers - Request headers object
 * @param userId - Optional user ID to add as header
 * @returns Sanitized headers object for microservice requests
 */
function extractForwardingHeaders(
  headers: Request['headers'],
  userId?: string,
): Record<string, string> {
  const forwardingHeaders: Record<string, string> = {};

  // Extract allowed headers
  for (const headerName of FORWARD_HEADERS) {
    const value = headers[headerName];
    if (value) {
      forwardingHeaders[headerName] = Array.isArray(value) ? value[0] : value;
    }
  }

  // Add user context if available
  if (userId) {
    forwardingHeaders['x-user-id'] = userId;
  }

  // Add request metadata
  forwardingHeaders['x-forwarded-by'] = 'api-gateway';
  forwardingHeaders['x-gateway-timestamp'] = new Date().toISOString();

  // Generate or preserve correlation ID for tracing
  const correlationId =
    headers['x-correlation-id'] ||
    headers['x-request-id'] ||
    generateCorrelationId();
  forwardingHeaders['x-correlation-id'] = Array.isArray(correlationId)
    ? correlationId[0]
    : correlationId;

  console.debug(
    `Extracted forwarding headers: ${JSON.stringify(Object.keys(forwardingHeaders))}`,
  );

  return forwardingHeaders;
}

/**
 * Extract user information from JWT token in authorization header
 * @param authHeader - Authorization header value
 * @returns User information object or null
 */
function extractUserFromAuth(authHeader?: string | string[]): {
  userId?: string;
  email?: string;
  roles?: string[];
} | null {
  if (!authHeader) {
    return null;
  }

  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!token || !token.startsWith('Bearer ')) {
    return null;
  }

  try {
    // Extract JWT payload (basic parsing without verification as that's done by guards)
    const jwtToken = token.substring(7); // Remove 'Bearer ' prefix
    const payload = JSON.parse(
      Buffer.from(jwtToken.split('.')[1], 'base64').toString(),
    );

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
    };
  } catch (error) {
    console.warn('Failed to parse JWT token for user extraction', error);
    return null;
  }
}

/**
 * Create headers specifically for file upload requests
 * @param headers - Original request headers
 * @param userId - User ID from authentication
 * @returns Headers optimized for file upload
 */
function extractFileUploadHeaders(
  headers: Request['headers'],
  userId?: string,
): Record<string, string> {
  const forwardingHeaders = extractForwardingHeaders(headers, userId);

  // For file uploads, we might need to handle multipart/form-data differently
  // The content-type and content-length are crucial for proper file handling
  if (headers['content-type']?.includes('multipart/form-data')) {
    // Keep the boundary information for multipart requests
    forwardingHeaders['content-type'] = Array.isArray(headers['content-type'])
      ? headers['content-type'][0]
      : headers['content-type'];
  }

  return forwardingHeaders;
}

/**
 * Generate a unique correlation ID for request tracing
 */
function generateCorrelationId(): string {
  return `gw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const headersForwarding = {
  extractForwardingHeaders,
  extractUserFromAuth,
  extractFileUploadHeaders,
  generateCorrelationId,
};
