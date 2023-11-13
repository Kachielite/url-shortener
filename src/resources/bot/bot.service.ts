import { Storage, UserData } from "@/resources/bot/bot.interface";
import TelegramBot, { Message } from "node-telegram-bot-api";
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
        urlGenerated: false,
        restart: false,
        end: false,
      };
      this.storage[chatId as keyof typeof this.storage] = userData;
    }
    return userData;
  }

  public initialMessage(bot: TelegramBot) {
    bot.onText(/\/start/, (msg: Message) => {
      const chatId = msg.chat.id;
      bot.sendMessage(
        chatId,
        "Hello! This bot can help you shorten long urls. To use it, please choose an option below:",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Shorten url", callback_data: "shorten_url" }],
              [{ text: "Customize short url", callback_data: "customize_url" }],
            ],
          },
        },
      );
    });
  }

  public async listener(chatId: number, data: string, bot: TelegramBot) {
    const userData = this.getUserData(chatId as number);
    switch (data) {
      case "shorten_url":
        userData.waitingForLongUrl = true;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCutomizeUrl = false;
        userData.urlGenerated = false;
        userData.restart = false;
        userData.end = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter the url you want to shorten",
        );
        break;
      case "customize_url":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = true;
        userData.waitingForLongUrlForCutomizeUrl = false;
        userData.urlGenerated = false;
        userData.restart = false;
        userData.end = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter customize url you want to use",
        );
        break;
      case "yes":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCutomizeUrl = false;
        userData.urlGenerated = false;
        userData.restart = true;
        userData.end = false;
        break;
      case "no":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCutomizeUrl = false;
        userData.urlGenerated = false;
        userData.restart = false;
        userData.end = true;
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
          userData.urlGenerated = true;
          this.restartUserData(chatId, bot);
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
          userData.urlGenerated = true;
          this.restartUserData(chatId, bot);
        } else if (userData.restart && userData.urlGenerated) {
          this.resetUserData(chatId);
          this.initialMessage(bot);
        } else if (userData.end && !userData.restart) {
        }
        this.resetUserData(chatId);
        await bot.sendMessage(
          chatId,
          "Thank you for using this bot. I hope you enjoyed the experience",
        );
      } catch (error: any) {
        throw new Error(error);
      }
    }
  }

  private restartUserData(chatId: number, bot: TelegramBot) {
    bot.sendMessage(chatId, "Do you want to create another shortened url?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes", callback_data: "yes" }],
          [{ text: "No", callback_data: "no" }],
        ],
      },
    });
  }

  private resetUserData(chatId: number) {
    let userData: UserData = this.storage[chatId as keyof typeof this.storage];
    userData.waitingForLongUrl = false;
    userData.waitingForCustomizeUrl = false;
    userData.waitingForLongUrlForCutomizeUrl = false;
    userData.urlGenerated = false;
    userData.restart = false;
  }
}

export default BotService;
