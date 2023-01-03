import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
  author: {
    type: String,
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
  source: {
    type: String,
    required: true,
  }
});

export const Photo = mongoose.model('photos', PhotoSchema);
