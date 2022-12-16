import { Router } from 'express';
import {PhotoService} from "../services/photo.service";
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

export class PhotoController {
    path = '/photo';

    router = Router();

    service = new PhotoService();

    constructor() {
        this.checkRoutes();
    }

    checkRoutes() {
        this.router.get('/download/:link', this.service.downloadPhotoFromAws);
        this.router.get('/list', this.service.getPhotoList);
        this.router.post('/upload', upload.array('file'), this.service.postPhoto);
    }

}
