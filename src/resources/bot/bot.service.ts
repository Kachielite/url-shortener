import { Storage, UserData } from "@/resources/bot/bot.interface";
import TelegramBot from "node-telegram-bot-api";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";
import ShortenerService from "@/resources/shortener/shortener.service";
class BotService {
  private storage: Storage = {};
  private ShortenerService = new ShortenerService();

  public getUserData(chatId: number) {
    let userData: UserData = this.storage[chatId as keyof typeof this.storage];
    if (!userData) {
      userData = {
        waitingForLongUrl: false,
        waitingForCustomizeUrl: false,
        waitingForLongUrlForCutomizeUrl: false,
        customCode: "",
      };
      this.storage[chatId as keyof typeof this.storage] = userData;
    }
    return userData;
  }

  public async listener(chatId: number, data: string, bot: TelegramBot) {
    switch (data) {
      case "shorten_url":
        const userDataShortUrl = this.getUserData(chatId as number);
        userDataShortUrl.waitingForLongUrl = true;
        userDataShortUrl.waitingForCustomizeUrl = false;
        userDataShortUrl.waitingForLongUrlForCutomizeUrl = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter the url you want to shorten",
        );
        break;
      case "customize_url":
        const userDataCustomizeUrl = this.getUserData(chatId as number);
        userDataCustomizeUrl.waitingForLongUrl = false;
        userDataCustomizeUrl.waitingForCustomizeUrl = true;
        userDataCustomizeUrl.waitingForLongUrlForCutomizeUrl = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter customize url you want to use",
        );
        break;
      default:
        break;
    }
  }

  public async responder(chatId: number, text: string, bot: TelegramBot) {
    let userData: UserData = this.storage[chatId as keyof typeof this.storage];
    if (userData) {
      try {
        if (
          userData.waitingForLongUrl &&
          !userData.waitingForCustomizeUrl &&
          !userData.waitingForLongUrlForCutomizeUrl
        ) {
          let shortenerData = await this.ShortenerService.generate(
            text as string,
          );
          await bot.sendMessage(
            chatId,
            `This is the shortened url: http://localhost:8000/${
              (shortenerData as ShortenerInterface).short_url
            }`,
          );
          this.resetUserData(chatId);
        } else if (
          !userData.waitingForLongUrl &&
          userData.waitingForCustomizeUrl &&
          !userData.waitingForLongUrlForCutomizeUrl
        ) {
          userData.waitingForLongUrl = false;
          userData.waitingForCustomizeUrl = true;
          userData.waitingForLongUrlForCutomizeUrl = true;
          userData.customCode = text as string;
          await bot.sendMessage(
            chatId,
            "Provide the long url to be used for the customization",
          );
        } else if (
          !userData.waitingForLongUrl &&
          userData.waitingForCustomizeUrl &&
          userData.waitingForLongUrlForCutomizeUrl
        ) {
          let shortenerData = await this.ShortenerService.customize(
            userData.customCode,
            text as string,
          );
          await bot.sendMessage(
            chatId,
            `This is the shortened url: http://localhost:8000/${
              (shortenerData as ShortenerInterface).short_url
            }`,
          );
          this.resetUserData(chatId);
        }
      } catch (error: any) {
        throw new Error(error);
      }
    }
  }

  private resetUserData(chatId: number) {
    const userData = this.getUserData(chatId);
    userData.waitingForLongUrl = false;
    userData.waitingForCustomizeUrl = false;
  }
}

export default BotService;
