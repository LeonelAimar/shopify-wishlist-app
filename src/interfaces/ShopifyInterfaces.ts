export enum MetafieldOwner {
    CUSTOMER = 'customer',
    ARTICLE = 'article',
    BLOG = 'blog',
    COLLECTION = 'collection',
    ORDER = 'order',
    DRAFT_ORDER = 'draft_order',
    PRODUCT = 'product',
    PRODUCT_VARIANT = 'variant',
    PRODUCT_IMAGE = 'product_image',
    PAGE = 'page',
    SHOP = 'shop',
}

export type MetafieldType = 'string' | 
    'integer' | 'boolean' | 'color' | 'json' | 'date' | 
    'file_reference' | 'date_time' | 'dimension' |
    'multi_line_text_field' | 'number_decimal' | 'number_integer' |
    'page_reference' | 'product_reference' | 'rating' |
    'single_line_text_field' | 'url' | 'variant_reference' |
    'volume' | 'weight'

export interface NewMetafieldObjectCreate {
    key: string;
    namespace: string;
    value: string | number;
    value_type?: 'string' | 'integer'; // Deprecated
    type: MetafieldType;
    description?: string | null;
    owner_resource:     MetafieldOwner;
    owner_id:           number;
}