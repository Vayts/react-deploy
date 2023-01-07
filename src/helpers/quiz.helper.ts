import {Request, Response} from "express";
import {S3File} from "../interfaces/S3File.interface";
import {AWSUploader} from "../services/bucket.service";
import {Quiz} from "../model/Quiz";

export function generateCorrectAnswersArr(arr: Array<any>) {
  const result: any[] = [];
  arr.forEach((question) => {
    question.answers.forEach((answer: any) => {
      if (answer.correct) {
        result.push(answer.id.toString());
      }
    })
  });
  return result;
}

export function generateResults(userAnswers: any[], correctAnswers: any[]) {
  const result: boolean[] = []
  userAnswers.forEach((answer: any, index: number) => {
    if (answer === correctAnswers[index]) {
      result.push(true);
    } else {
      result.push(false);
    }
  })
  return result;
}

export function convertQuestionToQuestionWithImg(questions: object[], imgArr: [{Key: string}]) {
  return questions.map((item: object, index: number) => {
    return {
      ...item,
      photo: imgArr[index].Key.split('photo/').join(''),
    }
  })
}

export function setQuizWithPhotos(req: Request, res: Response) {
  const files = req.files as  {[fieldname: string]: Express.Multer.File[]};
  const {title, description, category, timeToAnswer, withPhoto} = req.body;
  const pictures = <S3File[]><unknown>files.pictures;
  try {
    const s3 = new AWSUploader();
    s3.multiplyUpload(pictures, 'photo').then(async (response: any) => {
      const questionsBase = JSON.parse(req.body.questions);
      const questions = convertQuestionToQuestionWithImg(questionsBase, response);

      const photo = <S3File><unknown>files.file[0];
      const file = await s3.upload(photo, 'photo');
      const fileName = file.Key.split('photo/').join('');

      const value = await Quiz.insertMany({
        title,
        description,
        category,
        timeToAnswer,
        userAnswers: [],
        withPhoto,
        photo: fileName,
        questions,
      })
      const trends = await Quiz.aggregate([
        {$group: {_id: "$category", count: {$sum: 1}}},
        {$sort: {count: -1}}
      ])
      res.status(200).send({message: 'SUCCESS', value, trends})
    });
  } catch (e) {
    console.log(e);
    return res.status(409).send({message: 'CONNECTION_ERROR'});
  }
}

export async function setQuizWithoutPhotos(req: Request, res: Response) {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const {title, description, category, timeToAnswer, withPhoto} = req.body;
    const s3 = new AWSUploader();
    const photo = <S3File><unknown>files.file[0];
    const file = await s3.upload(photo, 'photo');
    const fileName = file.Key.split('photo/').join('');
    const questions = JSON.parse(req.body.questions);
    const response = await Quiz.insertMany({
      title,
      description,
      category,
      timeToAnswer,
      userAnswers: [],
      withPhoto,
      photo: fileName,
      questions,
    })
    const trends = await Quiz.aggregate([
      {$group: {_id: "$category", count: {$sum: 1}}},
      {$sort: {count: -1}}
    ])
    res.status(200).send({message: 'SUCCESS', value: response, trends})
  } catch (e) {
    console.log(e);
    return res.status(409).send({message: 'CONNECTION_ERROR'});
  }
}
