import { Response, Request, NextFunction } from 'express';
import ApplicationError from '../helpers/ApplicationError.js';
import config from '../config/config.js';

export function validateRequestOrigin( req: Request, res: Response, next: NextFunction ) {
    const { origin = false } = req.headers
    const isAllowedOrigin = !!origin && config.APP.ALLOWED_ORIGINS.includes(origin)
    
    if ( config.APP.IS_TEST ) return next()

    if ( !!!origin || !isAllowedOrigin ) throw new ApplicationError('Unauthorized request origin', 401, 'AuthorizationError');
    next()
}