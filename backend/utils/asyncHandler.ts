import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';

export const handleAsync =
  <
    P = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
  >(
    fn: (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response<ResBody>,
      next: NextFunction,
    ) => Promise<void>,
  ) =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ): void => {
    fn(req, res, next).catch(next);
  };
