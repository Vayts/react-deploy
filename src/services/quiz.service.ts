import {Request, Response} from "express";
import {Quiz} from "../model/Quiz";
import {AWSUploader} from "./bucket.service";
import {S3File} from "../interfaces/S3File.interface";
import {generateCorrectAnswersArr, generateResults} from "../helpers/quiz.helper";
import mongoose from "mongoose";

export class QuizService {
  
  async getQuizList(req: Request, res: Response) {
    const category: any = req.query.category;
    const search: any = req.query.search;
    try {
      const value = await Quiz.aggregate([
        {
          $match: { title: new RegExp(search, 'i'), category: category || {$exists: true}},
        },
        {
          $project: {
            title: 1,
            category: 1,
            timeToAnswer: 1,
            userAnswers: 1,
            author_id: 1,
            description: 1,
            photo: 1,
            questionsLength: {$cond: {if: {$isArray: "$questions"}, then: {$size: "$questions"}, else: "NA"}}
          }
        }
      ]);
      res.status(200).send({message: 'SUCCESS', value});
    } catch (err) {
      console.log(err);
      return res.status(409).send({message: 'CONNECTION_ERROR'});
    }
  }
    
    async getQuiz(req: Request, res: Response) {
      const {id} = req.params;
      try {
        const value = await Quiz.aggregate([
          {
            $match: { "_id": new mongoose.Types.ObjectId(id) },
          },
          {
            $project: {
              title: 1,
              category: 1,
              timeToAnswer: 1,
              userAnswers: 1,
              author_id: 1,
              description: 1,
              photo: 1,
              questions: {
                id: 1,
                question: 1,
                answers: {
                  id: 1,
                  text: 1,
                }
              }
            }
          },
        ]);
        res.status(200).send({message: 'SUCCESS', value});
      } catch (err) {
        return res.status(409).send({message: 'CONNECTION_ERROR'});
      }
    }
    async createQuiz(req: Request, res: Response) {
      try {
        const {title, description, category, timeToAnswer} = req.body;
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
          {$group: {_id: "$category", count: {$sum: 1}}},
          {$sort: {count: -1}}
        ])
        res.status(200).send({message: 'SUCCESS', value: response, trends})
      } catch (err) {
        return Promise.reject({code: 409, message: 'CONNECTION_ERROR'});
      }
    }
    async getQuizTrends(req: Request, res: Response) {
      try {
        const response = await Quiz.aggregate([
          {$group: {_id: "$category", count: {$sum: 1}}},
          {$sort: {count: -1}}
        ])
        res.status(200).send({message: 'SUCCESS', value: response});
      } catch (err) {
        return res.status(409).send({message: 'CONNECTION_ERROR'});
      }
    }
    
    async getQuizResult(req: Request, res: Response) {
      const {id} = req.params;
      const { userAnswers } = req.body;
      try {
        const quiz = await Quiz.aggregate([
          {
            $match: { "_id": new mongoose.Types.ObjectId(id) },
          },
          {
            $project: {
              questions: 1
            }
          },
        ]);
        const correctAnswers: any[] = generateCorrectAnswersArr(quiz[0].questions);
        const result = generateResults(userAnswers, correctAnswers);
        res.status(200).send({message: 'SUCCESS', value: result});
      } catch (e) {
        console.log(e);
        return res.status(409).send({message: 'CONNECTION_ERROR'});
      }
    }
  }
