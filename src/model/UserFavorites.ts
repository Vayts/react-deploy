import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserFavoriteSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    photo_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

export const UserFavorites = mongoose.model('user_favorite', UserFavoriteSchema);
