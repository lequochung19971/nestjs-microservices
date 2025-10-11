import createClient from 'openapi-fetch';
import { type components, type paths } from './client.generated';
import qs from 'qs';
import { convertResponseDates } from './utils';

export const httpClient = () => {
  const client = createClient<paths>({
    credentials: 'include',
    fetch: async (input) => {
      /**
       * If `httpClient` is used from server side, it will collect `cookie` and attach to `headers`
       */
      let cookie;

      input.headers.set('x-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
      return fetch(input, {
        headers: cookie
          ? {
              ...input.headers,
              Cookie: cookie,
            }
          : input.headers,
      });
    },
    querySerializer: (query) => {
      console.log(qs.stringify(query));
      return qs.stringify(query);
    },
  });
  // Store original methods to avoid recursive calls
  const originalDELETE = client.DELETE;
  const originalGET = client.GET;
  const originalPOST = client.POST;
  const originalPUT = client.PUT;
  const originalPATCH = client.PATCH;

  client.DELETE = ((...args: Parameters<typeof client.DELETE>) => {
    return originalDELETE(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.DELETE;

  client.GET = ((...args: Parameters<typeof client.GET>) => {
    return originalGET(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.GET;

  client.POST = ((...args: Parameters<typeof client.POST>) => {
    return originalPOST(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.POST;

  client.PUT = ((...args: Parameters<typeof client.PUT>) => {
    return originalPUT(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.PUT;

  client.PATCH = ((...args: Parameters<typeof client.PATCH>) => {
    return originalPATCH(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.PATCH;

  client.use({
    onError: (error) => {
      throw error.error;
    },
  });

  return client;
};
export type ApiSchema = components['schemas'];
