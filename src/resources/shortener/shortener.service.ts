import ShortenerModel from "@/resources/shortener/shortener.model";
import generateShortURL from "@/utils/helpers/shorturl-generator.helper";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";

class ShortenerService {
  private shortener = ShortenerModel;

  public async generate(long_url: string): Promise<ShortenerInterface> {
    try {
      const short_url = generateShortURL();
      return await this.shortener.create({ long_url, short_url });
    } catch (e) {
      console.log(e);
      throw new Error("Short url could not be generated");
    }
  }
}

export default ShortenerService;
