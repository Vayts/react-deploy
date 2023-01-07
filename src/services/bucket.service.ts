import S3 from 'aws-sdk/clients/s3';
import {S3File} from "../interfaces/S3File.interface";

const bucketName = <string>process.env.AWS_BUCKET_NAME;
const bucketRegion = <string>process.env.AWS_BUCKET_REGION;
const bucketAccess = <string>process.env.AWS_ACCESS_KEY;
const bucketSecret = <string>process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region: bucketRegion,
    accessKeyId: bucketAccess,
    secretAccessKey: bucketSecret,
})

export class AWSUploader {

    upload(file: S3File, folder: string) {
        const fileBody = file.buffer;
        const timeStamp = Date.now();
        const fileName = `${timeStamp}___${file.originalname.replace(/\s/g, '')}`;

        const uploadParams = {
            Bucket: bucketName,
            Body: fileBody,
            Key: `${folder}/${fileName}`,
        }

        return s3.upload(uploadParams).promise();
    }

    multiplyUpload(files: S3File[] | File[], folder: string) {
        const promiseArr: Promise<any>[] = [];
        files.forEach((el: any) => {
            promiseArr.push(this.upload(el, folder));
        })
        return Promise.all(promiseArr);
    }

    download(key: string, folder: string) {
        return new Promise((resolve, reject) => {
            const params = { Bucket: bucketName, Key: `${folder}/${key}` }
            const s3Stream = s3.getObject(params).createReadStream();
            s3Stream.on('error', reject);
            resolve(s3Stream);
        });
    }
}
