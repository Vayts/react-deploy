import {Request, Response} from "express";
import {Quiz} from "../model/Quiz";
import {
  generateCorrectAnswersArr,
  generateResults, setQuizWithoutPhotos,
  setQuizWithPhotos
} from "../helpers/quiz.helper";
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
            withPhoto: 1,
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
              withPhoto: 1,
              photo: 1,
              questions: {
                id: 1,
                question: 1,
                photo: 1,
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
        const files = req.files as  {[fieldname: string]: Express.Multer.File[]};
        if (files.pictures) {
          setQuizWithPhotos(req, res);
        } else {
          await setQuizWithoutPhotos(req, res);
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
