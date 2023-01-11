import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UsersCommentsSchema = new Schema({
    text: {
      type: String,
      required: true,
    },
    comment_author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    comment_author_login: {
        type: String,
        required: true,
    },
    photo_author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    photo_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

export const UserComments = mongoose.model('user_comment', UsersCommentsSchema);
