import { Document } from "mongoose";

export interface ShortenerInterface extends Document {
  long_url: string;
  short_url: string;
  clicks?: number;
}
