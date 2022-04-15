import ApplicationError from "./ApplicationError.js";

class HelpersController {
    static getShopifyConfig() {
        const { API_KEY = false , API_PASSWORD = false, SHOPIFY_DOMAIN = false } = process.env;
        const missing = [];
        if (!API_KEY) missing.push('API_KEY');
        if (!API_PASSWORD) missing.push('API_PASSWORD');
        if (!SHOPIFY_DOMAIN) missing.push('SHOPIFY_DOMAIN');

        if (missing.length)
            throw new ApplicationError(`Cannot initialize Shopify API Library. Missing values for: ${missing.join(', ')}`, 401, 'AuthorizationError');

        return  { API_KEY, API_PASSWORD, SHOPIFY_DOMAIN };
    }

    static sessionRemover<T>( classArray: T[] ): T[] {
        return classArray.map( (obj: any) => {
            if ( obj.session ) delete obj.session
            Object.keys(obj).forEach( key => {
                if ( Array.isArray( obj[key] ) ) 
                    obj[key] = this.sessionRemover( obj[key] )
            })

            return obj
        })
    }

    static joinCommaSeparated( array: any[] ) {
        return array.join(',')
    }
}

export default HelpersController