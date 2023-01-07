import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    userAnswers: {
        type: Array,
        required: true,
        default: [],
    },
    timeToAnswer: {
        type: Number,
        required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    author_id: {
        type: String,
        required: true,
        default: '63b21bd9f2051ad2b1f76f13',
    },
    withPhoto: {
        type: Boolean,
        required: true,
        default: false,
    },
    questions: [
        {
            id: {
              type: String,
              required: true,
            },
            question: {
                type: String,
                required: true,
            },
            photo: {
              type: String,
              required: false,
            },
            answers: [
                {
                    id: {
                      type: String,
                      required: true,
                    },
                    text: {
                        type: String,
                        required: true,
                    },
                    correct: {
                        type: Boolean,
                        required: true
                    },
                }
            ]
        },
    ]
});


export const Quiz = mongoose.model('quiz', QuizSchema);
