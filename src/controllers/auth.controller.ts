import { Router } from 'express';
import {AuthService} from "../services/auth.service";

export class AuthController {
    path = '/auth';

    router = Router();

    service = new AuthService();

    constructor() {
        this.checkRoutes();
    }

    checkRoutes() {
        this.router.post('/register', this.service.register);
        this.router.post('/login', this.service.login);
        this.router.get('/refresh', this.service.refresh);
        this.router.get('/logout', this.service.logout);
    }

}
