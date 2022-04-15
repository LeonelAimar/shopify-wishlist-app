import { ApiVersion, Shopify } from '@shopify/shopify-api'
import { 
    Customer, Metafield,
    Product
} from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';
import { GetMetafieldByOwnerParams, MetafieldOwner } from '../interfaces/ShopifyInterfaces.js';
import config from '../config/config.js'
import HelpersController from '../helpers/HelpersController.js';

class ShopifyProvider {
    private API_KEY: string
    private API_SECRET: string
    private SCOPES: string[]
    private DOMAIN: string

    constructor() {
        this.API_KEY = config.SHOPIFY.API_KEY
        this.API_SECRET = config.SHOPIFY.API_PASSWORD
        this.SCOPES = config.SHOPIFY.SCOPES
        this.DOMAIN = config.SHOPIFY.DOMAIN
        this.ctxConfig()
    }

    private ctxConfig() {
        Shopify.Context.initialize({
            API_KEY: config.SHOPIFY.API_KEY,
            API_SECRET_KEY: config.SHOPIFY.API_PASSWORD,
            SCOPES: config.SHOPIFY.SCOPES,
            HOST_NAME: config.SHOPIFY.DOMAIN,
            IS_EMBEDDED_APP: false,
            API_VERSION: ApiVersion.April22, // all supported versions are available, as well as "unstable" and "unversioned"
            SESSION_STORAGE: new Shopify.Session.MemorySessionStorage()
        })
    }

    public buildFakeSession() {
        return {
            isOnline: false,
            shop: this.DOMAIN,
            accessToken: this.API_SECRET,
            id: String(Date.now()),
            isActive: () => true,
            state: ''
        }
    }
    // ---------------------- END PRIVATE

    public async getMetafieldsByOwner({ id, resourceType, clearSession = false }: GetMetafieldByOwnerParams): Promise<Metafield[]> {
        const metafields = await Metafield.all({
            session: this.buildFakeSession(),
            metafield: {
                owner_id: id,
                owner_resource: resourceType
            }
        })

        return clearSession 
            ? HelpersController.sessionRemover<Metafield>(metafields) 
            : metafields
    }

    public async createMetafieldsByOwner( body: any ) {
        const metafield = new Metafield({
            session: this.buildFakeSession(),
            fromData: body
        })

        await metafield.save()

        return metafield
    }

    public async getProductsByHandles( handles: string ) {
        const products = await Product.all({
            session: this.buildFakeSession(),
            handle: handles
        })

        return HelpersController.sessionRemover(products)
    }
}

export default ShopifyProvider