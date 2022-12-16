import {HomeworkAnswer} from "./homeworkAnswer.interface";

export interface Deadline {
  _id: string;
  title: string;
  deadline: string;
  description: string;
  usefulLinks: [];
  studentsAnswers: HomeworkAnswer[]
}
