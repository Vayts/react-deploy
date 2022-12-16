import {Router} from "express";
import {PhotoService} from "../services/photo.service";
import {BaseService} from "../services/base.service";

export class BaseController {
    path = '/';

    router = Router();

    service = new BaseService();

    constructor() {
        this.checkRoutes();
    }

    checkRoutes() {
        this.router.get('*', this.service.sendApp)
    }

}
