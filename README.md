
# Shopify Wishlist App

### Overview
This is a back-end solution meant for usage as a Shopify private app. The app saves customer product wishlist into metafields to avoid the need for an external data store.

### How It Works
The app creates & updates a customer metafield that stores a string list of product handles (comma separated).

|Metafield | Value |
|----------|-------|
|customer.metafields.shopify_wishlist_app.wishlist|"product-handle-1,product-handle2,..."

The front-end can make requests to the app's endpoints to fetch, create, update or delete a wishlist.

### How To Use

1. Host this app on a server of your choice
2. Setup your server's environment variables
3. Query the app endpoints (via Javascript) from your Shopify theme to display or manipulate a customer's wishlist
4. If NODE_ENV variable runs as 'development', the app will allow no-origin requests, so you can test it from any rest client as **Postman**, make GET request directly from the browser url bar, etc. Then, on production, the app only let any request pass through ALLOWED_ORIGINS.

##### ENV Setup
```
# Origins/URLs that are allowed to make App/API requests
# Include the http/https protocols
# Comma separated for multiple origins
ALLOWED_ORIGINS=https://customer-wishlist.myshopify.com

# Wishlist's metafield namespace
WISHLIST_NAMESPACE=shopify_wishlist_app

# Wishlist's metafield key
WISHLIST_KEY=wishlist

# Allowed scopes from the created app, copy them from app's dashboard (Comma separated)
APP_SCOPES=read_products,write_products,read_product_listings,read_customers,write_customers,read_orders,write_orders,read_shipping,write_shipping,read_locations,read_inventory,write_inventory,read_checkouts,write_checkouts,read_shopify_payments_payouts,read_price_rules,write_price_rules,write_draft_orders

# The "myshopify" domain
SHOPIFY_DOMAIN=customer-wishlist.myshopify.com

# Shopify private app key
API_KEY=xxxxxxxxxxxxxxxxxxx

# Shopify private app password/secret/access_token
API_PASSWORD=xxxxxxxxxxxxxxxxxxx
```

### Request Endpoints

All endpoints require a single `:id` parameter in the URL which should represent a unique Shopify customer ID. Each request type may have extra data needed to fulfill the request, see below.

##### GET `/wishlist/:customerId`
---
**Query Parameters**
|Name|Required|Description|
|----:|:----:|----|
|format|optional|The format of the wishlist items to be returned. <br/><br/> Supported value: `product` <br/><br/> By default the wishlist will be returned as an `Array<string>` representing the product handles. Supplying the value `product` will return the wishlist as an `Array<object>` representing the full [Shopify product JSON](https://shopify.dev/api/admin-rest/2021-10/resources/product#[get]/admin/api/2021-10/products/{product_id}.json). |

**Response (Default)**
```
{
    "id": <customer-id>,
    "wishlist": [
        "<product-handle>",
        "<product-handle>",
        ...
    ],
    "metafield": {
        "id": <metafield-id>,
        "namespace": "shopify_wishlist_app",
        "key": "wishlist",
        "value": "<product-handle>,<product-handle>,...",
        "value_type": "string",
        "description": null,
        "owner_id": <customer-id>,
        "created_at": <date>,
        "updated_at": <date>
        "owner_resource": "customer",
        "admin_graphql_api_id": "gid://shopify/Metafield/<metafield-id>"
    },
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
**Response (Format: `product`)**

[Only displaying the `wishlist` response key for brevity]
```
{
    "wishlist": [
        { <shopify-product-JSON> },
        { <shopify-product-JSON> },
        ...
    ],
    ...
}
```

##### POST `/wishlist/:customerId`
---
**Body Parameters**
|Name|Required|Description|
|----:|:----:|----|
|handle|required|The Shopify product handle that should be added/removed from the wishlist. <br/><br/> This endpoint acts as a toggle. If the requested handle does not currently exist in the wishlist, add it, otherwise remove it.|

**Response**
```
{
    "metafield": {
        "id": <metafield-id>,
        "namespace": "shopify_wishlist_app",
        "key": "wishlist",
        "value": "<product-handle>,<product-handle>,...",
        "value_type": "string",
        "description": null,
        "owner_id": <customer-id>,
        "created_at": <date>,
        "updated_at": <date>
        "owner_resource": "customer",
        "admin_graphql_api_id": "gid://shopify/Metafield/<metafield-id>"
    },
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
##### DELETE `/wishlist/:customerId`
---
**Parameters** - None
---
Returns a cached version of the metafield to check how it looked like before being deleted.

**Response**
```
{
    "metafield": {
        "id": <metafield-id>,
        "namespace": "shopify_wishlist_app",
        "key": "wishlist",
        "value": "<product-handle>,<product-handle>,...",
        "value_type": "string",
        "description": null,
        "owner_id": <customer-id>,
        "created_at": <date>,
        "updated_at": <date>
        "owner_resource": "customer",
        "admin_graphql_api_id": "gid://shopify/Metafield/<metafield-id>"
    },
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
---
---
### Testing notes
 - If you wan't the testing to be faster and more flexible, please run the app on the server with NODE_ENV as 'development' so you'll be able to use any kind of rest client request generator, as Postman, REST Client, etc. (This requests has no origin on it, they are like server-side ones).
 - Only *GET, POST, DELETE* → **/wishlist/:customerId** should respond. The other ones may return 403 status with **{ authorized: false }** JSON body.
 - Sending no product *handle* prop on the POST route, should return a 400 Bad request error, with an error message.