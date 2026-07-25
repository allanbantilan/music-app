import { Context, MiddlewareHandler } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error('[Server Error]', err);

    if (err instanceof AppError) {
      return c.json(
        { success: false, error: err.message },
        err.status as ContentfulStatusCode
      );
    }

    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ success: false, error: message }, 500);
  }
};

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}
