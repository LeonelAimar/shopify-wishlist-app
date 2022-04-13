import ApplicationError from '../helpers/ApplicationError';
import { Request, Response, NextFunction } from 'express'

export const errorHandler = ( err: ApplicationError, req: Request, res: Response, next: NextFunction ) => {
    if (res.headersSent) return next(err);
  
    if (err.name === 'ApplicationError')
      res.status(err.code).json(err);
  
    else next(err);
}