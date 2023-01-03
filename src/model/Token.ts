import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    }
});

export const Token = mongoose.model('token', TokenSchema);
