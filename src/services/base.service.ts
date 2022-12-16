import {Request, Response} from "express";
import * as path from "path";

export class BaseService {
    sendApp(req: Request, res: Response) {
        res.sendFile(path.join(__dirname, '../../web/index.html'));
    }
}
