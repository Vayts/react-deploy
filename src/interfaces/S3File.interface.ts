export interface S3File extends File {
    path: string;
    buffer: Buffer;
    originalname: string;
}