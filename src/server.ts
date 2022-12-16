import { App } from './app';
import {PhotoController} from "./controllers/photo.controller";
import {BaseController} from "./controllers/base.controller";

const app = new App([new PhotoController(), new BaseController()]);

app.start();
