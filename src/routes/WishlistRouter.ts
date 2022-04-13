import { Router } from 'express';
import ApiController from '../controllers/WishlistController.js';

const WishlistController = new ApiController()

class WishlistRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    public routes() {
        this.router.get('/:customerId', WishlistController.getWishlistItems.bind(WishlistController))
        this.router.post('/:customerId', WishlistController.setWishlistItems.bind(WishlistController))
        this.router.delete('/:customerId', WishlistController.removeWishlist.bind(WishlistController))
    }
}

const wishlistRouter = new WishlistRouter()

export default wishlistRouter.router