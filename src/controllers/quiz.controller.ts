import { Router } from 'express';
import {QuizService} from "../services/quiz.service";
import {verifyUser} from "../middleware/verifyUser.middleware";
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

export class QuizController {
    path = '/quiz';

    router = Router();

    service = new QuizService();

    constructor() {
        this.checkRoutes();
    }

    checkRoutes() {
        this.router.get('/get_all', this.service.getQuizList);
        this.router.get('/get_quiz/:id', this.service.getQuiz);
        this.router.post('/create', verifyUser, upload.single('file'), this.service.createQuiz);
        this.router.post('/result/:id', this.service.getQuizResult);
        this.router.get('/get_trends', this.service.getQuizTrends);
    }

}
