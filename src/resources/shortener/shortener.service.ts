import ShortenerModel from "@/resources/shortener/shortener.model";
import generateShortURL from "@/utils/helpers/shorturl-generator.helper";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";

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
      const urlData = await this.shortener.findOneAndUpdate({ short_url });
      if (!urlData) {
        throw new Error("Long url not found");
      }

      if (urlData) {
        let clicks = urlData.clicks as number;
        urlData.clicks = clicks + 1;
        return await urlData.save();
      }
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async customize(custom_code: string) {
    try {
    } catch (error) {}
  }
}

export default ShortenerService;
