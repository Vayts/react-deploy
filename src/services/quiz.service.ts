import {Request, Response} from "express";
import {Quiz} from "../model/Quiz";
import {AWSUploader} from "./bucket.service";
import {S3File} from "../interfaces/S3File.interface";

export class QuizService {

    async getQuizList(req: Request, res: Response) {
        const category: any = req.query.category;
        const search: any = req.query.search;
        console.log(search);
        try {
            let value;
            if (category === '') {
                value = await Quiz.find({
                    "title": new RegExp(search)
                });
            } else {
                value = await Quiz.find(
                  {category,
                    "title": new RegExp(search)
                });
            }
            res.status(200).send({message: 'SUCCESS', value});
        } catch (err) {
            console.log(err);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async getQuiz (req: Request, res: Response) {
        const {id} = req.params;
        try {
            const value = await Quiz.find({_id: id})
            res.status(200).send({message: 'SUCCESS', value});
        } catch (err) {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async createQuiz(req: Request, res: Response) {
        try {
            const { title, description, category, timeToAnswer } = req.body;
            const s3 = new AWSUploader();
            const photo = <S3File><unknown>req.file;
            const file = await s3.upload(photo, 'photo');
            const fileName = file.Key.split('photo/').join('');
            const questions = JSON.parse(req.body.questions);
            const response = await Quiz.insertMany({
                title,
                description,
                category,
                timeToAnswer,
                userAnswers: [],
                photo: fileName,
                questions,
            })
            const trends = await Quiz.aggregate([
                { $group : { _id: "$category", count:{$sum:1}}},
                { $sort : { count :-1}}
            ])
            res.status(200).send({message: 'SUCCESS', value: response, trends})
        } catch (err) {
            return Promise.reject({code: 409, message: 'CONNECTION_ERROR'});
        }
    }

    async getQuizTrends (req: Request, res: Response) {
        try {
            const response = await Quiz.aggregate([
                { $group : { _id: "$category", count:{$sum:1}}},
                { $sort : { count :-1}}
            ])
            res.status(200).send({message: 'SUCCESS', value: response});
        } catch (err) {
            return Promise.reject({code: 409, message: 'CONNECTION_ERROR'});
        }
    }
}
