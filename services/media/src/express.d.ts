import * as express from 'src/express';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      name: string;
      sub: string;
    }
  }
}
