import { NextFunction, Request, Response } from 'express'
import { WishlistActionType } from '../interfaces/WishlistInterfaces.js'
import { MetafieldOwner, MetafieldType } from '../interfaces/ShopifyInterfaces.js'
import { Metafield } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js'

import ApplicationError from '../helpers/ApplicationError.js'
import ShopifyProvider from '../providers/ShopifyProvider.js'
import { statusSuccess as status } from '../helpers/constants.js'
import HelpersController from '../helpers/HelpersController.js'
import config from '../config/config.js'

const ShopifySDK = new ShopifyProvider()

class WishlistController {
    private async handleErrors( error: any, next: NextFunction ) {
        const { statusCode, statusMessage } = error
        const errorStatusCode = statusCode || error.code || 500;
        const errorStatusMsg = statusMessage || error.message || 'Something went wrong';

        next(new ApplicationError(errorStatusMsg, errorStatusCode, error.name, {
            source: statusMessage && 'ShopifyAPI' || 'ApiController',
            ...error,
        }))
    }

    private async getOnlyWishlistMetafields( customerId: number | string ): Promise<Metafield | undefined> {
        const { METAFIELD } = config

        const metafields = await ShopifySDK.getMetafieldsByOwner({
            id: Number(customerId),
            resourceType: MetafieldOwner.CUSTOMER
        })
        
        return metafields.find(({ namespace, key }) => 
            namespace === METAFIELD.WISHLIST_NAMESPACE &&
            key === METAFIELD.WISHLIST_KEY
        )
    }

    private async handleUpdateMeta( metafield: Metafield, handle: string ) {
        const arrayValue = (metafield.value as string).split(',')
        const existHandle = arrayValue.includes(handle)
        const excludeFilterFn = (x: string) => x !== handle

        metafield.value = HelpersController.joinCommaSeparated( 
            existHandle ? arrayValue.filter(excludeFilterFn) : [...arrayValue, handle]
        )
        
        return {
            type: !!metafield.value ? WishlistActionType.UPDATE : WishlistActionType.DELETE
        }
    }

    private async handleCreateMeta( customerId: number | string, handle: string ) {
        const { METAFIELD } = config

        const metafield = await ShopifySDK.createMetafieldsByOwner({
            customer_id: Number(customerId),
            namespace: METAFIELD.WISHLIST_NAMESPACE,
            key: METAFIELD.WISHLIST_KEY,
            value: handle,
            type: MetafieldType.STRING
        })

        return metafield
    }
    // ------------------ END PRIVATE

    public async getWishlistItems( req: Request, res: Response, next: NextFunction ) {
        try {
            const { customerId } = req.params
            const { format } = req.query

            const metafield = await this.getOnlyWishlistMetafields( customerId )
            metafield && delete metafield.session

            const wishlist = !!!metafield
                ? []
                : format === 'product'
                    ? await ShopifySDK.getProductsByHandles( metafield.value as string )
                    : (metafield.value as string).split(',')

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

            if ( !!!handle ) 
                throw {
                    message: 'You must provide a valid string product handle on the body request.',
                    code: 400
                }

            const wishlistMeta = await this.getOnlyWishlistMetafields( customerId )
            const wishlistMetaBackup = { ...wishlistMeta } as Metafield

            const payload = wishlistMeta
                ? await this.handleUpdateMeta(wishlistMeta, handle)
                : { type: WishlistActionType.CREATE }

            let metafield = {} as Metafield;

            switch(payload.type) {
                case WishlistActionType.CREATE:
                    const createdMeta = await this.handleCreateMeta( customerId, handle )
                    delete createdMeta.session
                    metafield = createdMeta
                    break;
                case WishlistActionType.UPDATE:
                    await wishlistMeta.save()
                    delete wishlistMeta.session
                    metafield = wishlistMeta
                    break;
                case WishlistActionType.DELETE:
                    await wishlistMeta.delete()
                    delete wishlistMetaBackup.session
                    metafield = wishlistMetaBackup
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

            const metafield = await this.getOnlyWishlistMetafields( customerId )

            let resolve = null

            if ( !!metafield ) {
                await metafield.delete()
                delete metafield.session
                resolve = metafield
            }

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