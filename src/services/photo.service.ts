import {AWSUploader} from "./bucket.service";
import {Request, Response} from "express";
import {Photo} from "../model/Photo";
import {S3File} from "../interfaces/S3File.interface";

export class PhotoService {

    downloadPhotoFromAws(req: Request, res: Response) {
        const s3 = new AWSUploader();
        const readStream = s3.download(req.params.link, 'photo');
        readStream.then((data: any) => {
            data.pipe(res);
        }).catch(() => {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        })
    }

    async postPhoto(req: Request, res: Response) {
        const {title, description, categories} = req.body;
        console.log(req.user.login)
        const s3 = new AWSUploader();
        const photo = <S3File[]><unknown>req.files;
        const file = await s3.upload(photo[0], 'photo');
        const fileName = file.Key.split('photo/').join('');
        const categoriesArr = categories.trim().split(' ');
        await Photo.insertMany({
            author: req.user.login,
            title,
            description,
            categories: categoriesArr,
            source: fileName,
        })
        res.status(200).end();
    }

    async getPhotoList(req: Request, res: Response) {
        let query: any = req.query.categories;
        const queryArr = query.split(',').map((item: any) => item.toLowerCase());
        try {
            let response;
            if (query === '') {
                response = await Photo.find({});
            } else {
                response = await Photo.find({ categories : { $in : queryArr }});
            }
            res.status(200).send({message: 'SUCCESS', value: response});
        } catch (err) {
            return Promise.reject({code: 409, message: 'CONNECTION_ERROR'});
        }
    }
}
