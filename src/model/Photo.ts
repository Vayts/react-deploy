import mongoose from "mongoose";
import moment from "moment";
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
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
  categories: {
    type: Array,
    required: true,
  },
  time: {
    type: Date,
    required: true,
    default: moment(),
  },
  source: {
    type: String,
    required: true,
  }
});

export const Photo = mongoose.model('photos', PhotoSchema);
