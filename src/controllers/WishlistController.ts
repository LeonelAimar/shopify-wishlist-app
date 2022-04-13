import ApplicationError from '../helpers/ApplicationError.js'
import { 
    NewWishlistMetafieldGenerator, 
    UpdateWishlistMetafieldGenerator, 
    WishlistActionType 
} from '../interfaces/WishlistInterfaces.js'
import { MetafieldOwner } from '../interfaces/ShopifyInterfaces.js'
import { NextFunction, Request, Response } from 'express'
import Shopify, { IMetafield } from 'shopify-api-node'
import config, { getShopifyConfig } from '../config/config.js'

import { statusSuccess as status } from '../helpers/constants.js'

const shopify = new Shopify(getShopifyConfig())

class WishlistController {
    private generateMetafieldUpdatePackage( 
        metafield: IMetafield, 
        productHandle: string 
    ): UpdateWishlistMetafieldGenerator {
        const  { id, value } = metafield;

        let wishlist: string | string[] = String(value).split(',');
        const itemIndex = wishlist.indexOf(productHandle);
        const removeItem = itemIndex !== -1;

        if (removeItem) wishlist.splice(itemIndex, 1);
        else wishlist.push(productHandle);

        // Delete
        if (!wishlist.length)
            return {
                type: WishlistActionType.DELETE,
                metafield: {
                    id,
                },
            }
        
        // Update
        wishlist = wishlist.join(',');
        return {
            type: WishlistActionType.UPDATE,
            metafield: {
                id,
            },
            body: {
                id,
                value_type: 'string',
                value: wishlist,
            },
        }; 
    }

    private generateNewMetafieldPackage( customerId: number, productHandle: string ): NewWishlistMetafieldGenerator {
        const { METAFIELD } = config

        return {
            type: WishlistActionType.CREATE,
            customer: {
                id: customerId,
            },
            body: {
                namespace: METAFIELD.WISHLIST_NAMESPACE,
                key: METAFIELD.WISHLIST_KEY,
                type: 'string',
                value: productHandle,
                owner_id: customerId,
                owner_resource: MetafieldOwner.CUSTOMER
            },
        }
    }

    private async getWishlistMetafield( ownerId: number ) {
        const { METAFIELD } = config
        
        const metafields = await shopify.metafield.list({
            metafield: {
                owner_resource: 'customer',
                owner_id: ownerId
            }
        })

        return metafields.find(({ namespace, key }) => 
            namespace === METAFIELD.WISHLIST_NAMESPACE &&
            key === METAFIELD.WISHLIST_KEY
        )
    }

    private async handleErrors( error: any, next: NextFunction ) {
        const { statusCode, statusMessage } = error
        const errorStatusCode = statusCode || error.code || 500;
        const errorStatusMsg = statusMessage || error.message || 'Something went wrong';

        next(new ApplicationError(errorStatusMsg, errorStatusCode, error.name, {
            source: statusMessage && 'ShopifyAPI' || 'ApiController',
            ...error,
        }))
    }
    // ------------------ END PRIVATE

    public async getWishlistItems( req: Request, res: Response, next: NextFunction ) {
        try {
            const { customerId } = req.params
            const { format } = req.query

            const metafield = await this.getWishlistMetafield( Number(customerId) )

            const wishlist = !!!metafield
                ? []
                : format === 'product'
                    ? await shopify.product.list({ handle: metafield.value })
                    : String(metafield.value).split(',')

            return res.json({
                id: Number(customerId),
                wishlist,
                metafield,
                status
            })
        } catch (err) {
            this.handleErrors(err, next)
        }
    }

    public async setWishlistItems( req: Request, res: Response, next: NextFunction ) {
        try {
            const { customerId } = req.params
            const { handle } = req.body

            const wishlistMeta = await this.getWishlistMetafield( Number(customerId) )

            const payload = wishlistMeta
                ? this.generateMetafieldUpdatePackage(wishlistMeta, handle)
                : this.generateNewMetafieldPackage(Number(customerId), handle);

            let metafield = {};

            switch(payload.type) {
                case WishlistActionType.CREATE:
                    const cPayload = payload as NewWishlistMetafieldGenerator
                    // metafield = await shopify.customer
                    //     .update(cPayload.customer.id, payload.body)
                    //     .then(() => cPayload.body.metafields[0])
                    metafield = await shopify.metafield.create(cPayload.body)
                    break;
                case WishlistActionType.UPDATE:
                    const uPayload = payload as UpdateWishlistMetafieldGenerator
                    metafield = await shopify.metafield
                        .update(uPayload.metafield.id, uPayload.body)
                    break;
                case WishlistActionType.DELETE:
                    const dPayload = payload as UpdateWishlistMetafieldGenerator
                    metafield = await shopify.metafield
                        .delete(dPayload.metafield.id)
                        .then(() => { return {} })
                    break;
                default: break;
            };

            return res.json({
                metafield,
                status,
            })
        } catch (err) {
            this.handleErrors(err, next)
        }
    }

    public async removeWishlist( req: Request, res: Response, next: NextFunction ) {
        try {
            const { customerId } = req.params

            const metafield = await this.getWishlistMetafield( Number(customerId) )

            const resolve = metafield
                ? await shopify.metafield.delete(metafield.id)
                : null;

            return res.json({
                metafield: resolve,
                status,
            })
        } catch (err) {
            this.handleErrors(err, next)
        }
    }
}

export default WishlistController