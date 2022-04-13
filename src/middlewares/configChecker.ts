import { Request, Response, NextFunction } from 'express'
import config from '../config/config.js'
import ApplicationError from '../helpers/ApplicationError.js';

export const configChecker = ( req: Request, res: Response, next: NextFunction ) => {
    const { API_KEY, API_PASSWORD, DOMAIN } = config.SHOPIFY;
    const missing = [];
    if ( !API_KEY ) missing.push('API_KEY');
    if ( !API_PASSWORD ) missing.push('API_PASSWORD');
    if ( !DOMAIN ) missing.push('SHOPIFY_DOMAIN');

    if (missing.length)
        throw new ApplicationError(`Cannot initialize Shopify API Library. Missing values for: ${missing.join(', ')}`, 401, 'AuthorizationError');

    next()
}