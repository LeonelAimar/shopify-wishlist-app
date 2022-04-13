import express from 'express';
import cors from 'cors';
import config from './config/config.js'

// Middlewares
import { configChecker } from './middlewares/configChecker.js'

// Routes
import WishlistRouter from './routes/WishlistRouter.js';
import { validateRequestOrigin } from './middlewares/validateRequestOrigin.js';
import { errorHandler } from './middlewares/errorHandler.js';

class Server {
    public app: express.Application;
    public PORT: number;

    constructor() {
        this.app = express()
        this.PORT = config.APP.PORT
        this.config()
        this.routes()
    }

    public config() {
        this.app.set('PORT', this.PORT)
        this.app.use(validateRequestOrigin)
        this.app.use(configChecker)
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
    }
    
    public routes() {
        this.app.use('/wishlist', WishlistRouter)
        this.app.get('*', (req, res) => res.status(403).json({ authorized: false }))
        this.app.use(errorHandler)
    }

    public listen() {
        this.app.listen(this.app.get('PORT'), () => {
            console.log(`Server running on ${this.PORT}`)
        })
    }
}

const server = new Server()
server.listen()