import { z } from 'zod';
import { insertGreetingSchema } from './schema';

// === ERROR SCHEMAS ===
export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  validation: z.object({ message: z.string(), field: z.string().optional() }),
};

// === API CONTRACT ===
export const api = {
  counter: {
    get: {
      method: 'GET' as const,
      path: '/api/counter',
      responses: {
        200: z.object({ id: z.number(), name: z.string(), value: z.number() }),
      },
    },
    increment: {
      method: 'POST' as const,
      path: '/api/counter/increment',
      responses: {
        200: z.object({ id: z.number(), name: z.string(), value: z.number() }),
      },
    },
    decrement: {
      method: 'POST' as const,
      path: '/api/counter/decrement',
      responses: {
        200: z.object({ id: z.number(), name: z.string(), value: z.number() }),
      },
    },
    reset: {
      method: 'POST' as const,
      path: '/api/counter/reset',
      responses: {
        200: z.object({ id: z.number(), name: z.string(), value: z.number() }),
      },
    },
  },
  greetings: {
    list: {
      method: 'GET' as const,
      path: '/api/greetings',
      responses: {
        200: z.array(z.object({ id: z.number(), name: z.string(), message: z.string() })),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/greetings',
      input: insertGreetingSchema,
      responses: {
        201: z.object({ id: z.number(), name: z.string(), message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/greetings/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// === URL BUILDER ===
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// === TYPE HELPERS ===
export type CounterResponse = z.infer<typeof api.counter.get.responses[200]>;
export type GreetingInput = z.infer<typeof api.greetings.create.input>;
export type GreetingResponse = z.infer<typeof api.greetings.create.responses[201]>;
export type GreetingsListResponse = z.infer<typeof api.greetings.list.responses[200]>;
