import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserLikesSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    photo_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

export const UserLikes = mongoose.model('user_like', UserLikesSchema);
