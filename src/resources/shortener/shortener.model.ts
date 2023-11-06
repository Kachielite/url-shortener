import { model, Schema } from "mongoose";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";

const ShortenerModel = new Schema(
  {
    long_url: {
      type: String,
      required: true,
    },
    short_url: {
      type: String,
      unique: true,
    },
    clicks: {
      type: Number,
    },
  },
  { timestamps: true },
);

export default model<ShortenerInterface>("Shortener", ShortenerModel);
