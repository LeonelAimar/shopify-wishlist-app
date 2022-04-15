import { config as envConfig } from 'dotenv';
envConfig();

const config = {
    SHOPIFY: {
        API_KEY: process.env.API_KEY || '',
        API_PASSWORD: process.env.API_PASSWORD || '',
        DOMAIN: process.env.SHOPIFY_DOMAIN || '',
        SCOPES: (process.env.APP_SCOPES || '').split(',')
    },
    METAFIELD: {
        WISHLIST_NAMESPACE: process.env.METAFIELD_NAMESPACE || 'shopify_wishlist_app',
        WISHLIST_KEY: process.env.METAFIELD_KEY || 'wishlist'
    },
    APP: {
        IS_TEST: process.env.NODE_ENV === 'development',
        PORT: process.env.PORT && Number(process.env.PORT) || 5000,
        ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(',')
    }
}

export default config