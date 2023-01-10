import { Router } from 'express';
import {PhotoService} from "../services/photo.service";
import {addUser, verifyUser} from "../middleware/verifyUser.middleware";
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
        this.router.get('/list', addUser, this.service.getPhotoList);
        this.router.get('/like/:id', verifyUser, this.service.photoLike);
        this.router.get('/liked_photos', verifyUser, this.service.getUserLiked);
        this.router.get('/favorite/:id', verifyUser, this.service.setFavorite);
        this.router.get('/favorite_photos', verifyUser, this.service.getUserFavorites)
        this.router.get('/user_photos', verifyUser, this.service.getUserPhoto);
        this.router.post('/upload', verifyUser, upload.array('file'), this.service.postPhoto);
    }

}
