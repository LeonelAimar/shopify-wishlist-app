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

export enum MetafieldType {
    STRING = 'string',
    INTEGER = 'integer',
    BOOLEAN = 'boolean',
    COLOR = 'color',
    JSON = 'json',
    DATE = 'date',
    DATE_TIME = 'date_time',
    FILE_REFERENCE = 'file_reference',
    PRODUCT_REFERENCE = 'product_reference',
    VARIANT_REFERENCE = 'variant_reference',
    PAGE_REFERENCE = 'page_reference',
    DIMENSION = 'dimension',
    NUMBER_DECIMAL = 'number_decimal',
    NUMBER_INTEGER = 'number_integer',
    SINGLE_LINE_TEXT_FIELD = 'single_line_text_field',
    URL = 'URL',
    RATING = 'rating',
    VOLUME = 'volume',
    WEIGHT = 'weight'
}

export type MetafieldTypes = 'string' | 
    'integer' | 'boolean' | 'color' | 'json' | 'date' | 
    'file_reference' | 'date_time' | 'dimension' |
    'multi_line_text_field' | 'number_decimal' | 'number_integer' |
    'page_reference' | 'product_reference' | 'rating' |
    'single_line_text_field' | 'url' | 'variant_reference' |
    'volume' | 'weight'


export interface GetMetafieldByOwnerParams {
    id:             number;
    resourceType:   MetafieldOwner;
    clearSession?:  boolean;
}