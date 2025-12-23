import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
  _id: string;
  Title: string;
  Artist: string;
  Album: string;
  Genre: string;
}
const songSchema: Schema<ISong> = new Schema({
  Title: { type: String, required: true },
  Artist: { type: String, required: true },
  Album: { type: String, required: true },
  Genre: { type: String, required: true },
});

export default mongoose.model<ISong>("Song", songSchema);
