import { App } from './app';
import {PhotoController} from "./controllers/photo.controller";
import {QuizController} from "./controllers/quiz.controller";
import {AuthController} from "./controllers/auth.controller";
import {BaseController} from "./controllers/base.controller";

const app = new App([new PhotoController(), new QuizController(), new AuthController(), new BaseController()]);

app.start();
