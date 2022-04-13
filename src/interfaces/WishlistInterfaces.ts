import { NewMetafieldObjectCreate } from "./ShopifyInterfaces";

export enum WishlistActionType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

export interface NewWishlistMetafieldGenerator {
    type:           WishlistActionType;
    customer:       { id: number };
    body:           NewMetafieldObjectCreate;
}

export interface UpdateWishlistMetafieldGenerator {
    type:           WishlistActionType;
    metafield:      { id: number };
    body?:          { id: number; value_type: 'string'; value: string };
}