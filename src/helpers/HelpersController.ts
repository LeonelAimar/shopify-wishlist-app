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
        return classArray.map( (something: any) => {
            if ( something.session ) delete something.session
            Object.keys(something).forEach( value => {
                if ( Array.isArray(something[value]) ) 
                    something[value] = this.sessionRemover(something[value])
            })

            return something
        })
    }

    static joinCommaSeparated( array: any[] ) {
        return array.join(',')
    }
}

export default HelpersController