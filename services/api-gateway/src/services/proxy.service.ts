import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface Headers {
  [key: string]: string | string[] | undefined;
}

export interface QueryParams {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean>;
}

export interface ProxyRequestOptions {
  serviceName: string;
  path: string;
  method: HttpMethod;
  headers?: Headers;
  body?: Record<string, unknown>;
  params?: QueryParams;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getServiceUrl(serviceName: string): string {
    const serviceUrl = this.configService.get<string>(
      `${serviceName.toUpperCase()}_SERVICE_URL`,
    );
    if (!serviceUrl) {
      throw new Error(
        `Service URL for ${serviceName} not found in configuration`,
      );
    }
    return serviceUrl;
  }

  async forwardRequest<T = unknown>(options: ProxyRequestOptions): Promise<T> {
    try {
      const {
        serviceName,
        path,
        method,
        headers = {},
        body = {},
        params = {},
      } = options;

      switch (method.toLowerCase() as HttpMethod) {
        case 'get':
          return this.get<T>(serviceName, path, headers, params);
        case 'post':
          return this.post<T>(serviceName, path, body, headers, params);
        case 'put':
          return this.put<T>(serviceName, path, body, headers, params);
        case 'delete':
          return this.delete<T>(serviceName, path, headers, params);
        case 'patch':
          return this.patch<T>(serviceName, path, body, headers, params);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      this.logger.error(
        `Error forwarding request: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async get<T = unknown>(
    serviceName: string,
    path: string,
    headers: Headers = {},
    params: QueryParams = {},
  ): Promise<T> {
    const url = this.buildServiceUrl(serviceName, path);
    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params,
    };

    this.logger.log(`Forwarding GET request to ${url}`);

    const response = await firstValueFrom(
      this.httpService
        .get<T>(url, config)
        .pipe(catchError((error: AxiosError) => this.handleError(error))),
    );

    return response.data;
  }

  async post<T = unknown>(
    serviceName: string,
    path: string,
    body: Record<string, unknown> = {},
    headers: Headers = {},
    params: QueryParams = {},
  ): Promise<T> {
    const url = this.buildServiceUrl(serviceName, path);
    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params,
    };

    this.logger.log(`Forwarding POST request to ${url}`);

    const response = await firstValueFrom(
      this.httpService
        .post<T>(url, body, config)
        .pipe(catchError((error: AxiosError) => this.handleError(error))),
    );

    return response.data;
  }

  async put<T = unknown>(
    serviceName: string,
    path: string,
    body: Record<string, unknown> = {},
    headers: Headers = {},
    params: QueryParams = {},
  ): Promise<T> {
    const url = this.buildServiceUrl(serviceName, path);
    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params,
    };

    this.logger.log(`Forwarding PUT request to ${url}`);

    const response = await firstValueFrom(
      this.httpService
        .put<T>(url, body, config)
        .pipe(catchError((error: AxiosError) => this.handleError(error))),
    );

    return response.data;
  }

  async delete<T = unknown>(
    serviceName: string,
    path: string,
    headers: Headers = {},
    params: QueryParams = {},
  ): Promise<T> {
    const url = this.buildServiceUrl(serviceName, path);
    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params,
    };

    this.logger.log(`Forwarding DELETE request to ${url}`);

    const response = await firstValueFrom(
      this.httpService
        .delete<T>(url, config)
        .pipe(catchError((error: AxiosError) => this.handleError(error))),
    );

    return response.data;
  }

  async patch<T = unknown>(
    serviceName: string,
    path: string,
    body: Record<string, unknown> = {},
    headers: Headers = {},
    params: QueryParams = {},
  ): Promise<T> {
    const url = this.buildServiceUrl(serviceName, path);
    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params,
    };

    this.logger.log(`Forwarding PATCH request to ${url}`);

    const response = await firstValueFrom(
      this.httpService
        .patch<T>(url, body, config)
        .pipe(catchError((error: AxiosError) => this.handleError(error))),
    );

    return response.data;
  }

  private buildServiceUrl(serviceName: string, path: string): string {
    const serviceUrl = this.getServiceUrl(serviceName);
    return `${serviceUrl}${path}`;
  }

  private filterHeaders(headers: Headers): Headers {
    // Clone headers and remove specific ones we don't want to forward
    const filteredHeaders: Headers = { ...headers };

    // Headers that should not be forwarded to downstream services
    const excludedHeaders = [
      'host',
      'connection',
      'content-length',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-fetch-site',
      'sec-fetch-mode',
      'sec-fetch-dest',
      'referer',
      'accept-encoding',
    ];

    excludedHeaders.forEach((header) => {
      delete filteredHeaders[header];
    });

    return filteredHeaders;
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      this.logger.error(
        `Service responded with status ${status}: ${JSON.stringify(data)}`,
      );
      throw new HttpException(data, status);
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error('No response received from service');
      throw new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      this.logger.error(`Error setting up request: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
