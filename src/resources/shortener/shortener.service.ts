import ShortenerModel from "@/resources/shortener/shortener.model";
import generateShortURL from "@/utils/helpers/shorturl-generator.helper";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";
import mongoose from "mongoose";

class ShortenerService {
  private shortener = ShortenerModel;

  public async generate(long_url: string): Promise<ShortenerInterface | Error> {
    try {
      const short_url = generateShortURL();
      return await this.shortener.create({ long_url, short_url, clicks: 0 });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async redirect(
    short_url: string,
  ): Promise<ShortenerInterface | Error | void> {
    try {
      const urlData = await this.shortener.findOne({ short_url });
      if (!urlData) {
        throw new Error("Long url not found");
      }

      if (urlData) {
        let clicks = urlData.clicks as number;
        urlData.clicks = clicks + 1;
        return await urlData.save();
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async customize(custom_code: string, long_url: string) {
    try {
      const checkCustomCodeIsNotUsed = await this.shortener.findOne({
        short_url: custom_code,
      });

      if (checkCustomCodeIsNotUsed) {
        throw new Error("Custom code provided already in use");
      }
      return await this.shortener.create({
        short_url: custom_code,
        long_url,
        clicks: 0,
      });
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async delete(ids: string[]) {
    try {
      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      await this.shortener.deleteOne({ _id: { $in: objectIds } });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async getAll(page: number = 0) {
    const limit: number = 10;
    try {
      return await this.shortener
        .find({})
        .limit(limit)
        .skip(limit * page)
        .sort({ clicks: "asc" });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export default ShortenerService;
