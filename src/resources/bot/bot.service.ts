import TelegramBot, { Message } from "node-telegram-bot-api";
import QRCode from "qrcode";
import { Storage, UserData } from "@/resources/bot/bot.interface";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";
import ShortenerService from "@/resources/shortener/shortener.service";
const path = require("path");

// Get the root directory of the project
const rootDir = path.resolve(__dirname, "../../..");
const qrCodePath = path.join(rootDir, "./qr-codes/file.png");

class BotService {
  private storage: Storage = {};
  private ShortenerService = new ShortenerService();

  public getUserData(chatId: number) {
    let userData: UserData = this.storage[chatId as keyof typeof this.storage];
    if (!userData) {
      userData = {
        waitingForLongUrl: false,
        waitingForCustomizeUrl: false,
        waitingForLongUrlForCustomizeUrl: false,
        customCode: "",
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

  public shortenerService(bot: TelegramBot) {
    bot.onText(/\/shorten/, (msg: Message) => {
      const chatId = msg.chat.id;
      const userData = this.getUserData(chatId as number);
      userData.waitingForLongUrl = true;
      userData.waitingForCustomizeUrl = false;
      userData.waitingForLongUrlForCustomizeUrl = false;
      bot.sendMessage(
        chatId as number,
        "Please enter the url you want to shorten",
      );
    });
  }

  public personalizeService(bot: TelegramBot) {
    bot.onText(/\/personalize/, (msg: Message) => {
      const chatId = msg.chat.id;
      const userData = this.getUserData(chatId as number);
      userData.waitingForLongUrl = false;
      userData.waitingForCustomizeUrl = true;
      userData.waitingForLongUrlForCustomizeUrl = false;
      bot.sendMessage(
        chatId as number,
        "Please enter customize url you want to use",
      );
    });
  }

  public restartUserData(chatId: number, bot: TelegramBot) {
    bot.sendMessage(chatId, "Do you want to create another shortened url?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes", callback_data: "yes" }],
          [{ text: "No", callback_data: "no" }],
        ],
      },
    });
  }

  public async listener(chatId: number, data: string, bot: TelegramBot) {
    const userData = this.getUserData(chatId as number);
    switch (data) {
      case "shorten_url":
        userData.waitingForLongUrl = true;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCustomizeUrl = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter the url you want to shorten",
        );
        break;
      case "customize_url":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = true;
        userData.waitingForLongUrlForCustomizeUrl = false;
        await bot.sendMessage(
          chatId as number,
          "Please enter customize url you want to use",
        );
        break;
      case "yes":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCustomizeUrl = false;
        await bot.sendMessage(
          chatId,
          "Hello! This bot can help you shorten long urls. To use it, please choose an option below:",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Shorten url", callback_data: "shorten_url" }],
                [
                  {
                    text: "Customize short url",
                    callback_data: "customize_url",
                  },
                ],
              ],
            },
          },
        );
        break;
      case "no":
        userData.waitingForLongUrl = false;
        userData.waitingForCustomizeUrl = false;
        userData.waitingForLongUrlForCustomizeUrl = false;
        await bot.sendMessage(
          chatId,
          "Thank you for using this bot. I hope you enjoyed the experience",
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
          !userData.waitingForLongUrlForCustomizeUrl
        ) {
          let shortenerData = await this.ShortenerService.generate(
            text as string,
          );
          await QRCode.toFile(
            qrCodePath,
            `http://localhost:8000/${
              (shortenerData as ShortenerInterface).short_url
            }`,
            {
              errorCorrectionLevel: "H",
            },
            function (err) {
              if (err) throw err;
              bot
                .sendPhoto(chatId, qrCodePath, {
                  caption: `This is the shortened url: http://localhost:8000/${
                    (shortenerData as ShortenerInterface).short_url
                  }`,
                })
                .then(() => {
                  bot.sendMessage(
                    chatId,
                    "Do you want to create another shortened url?",
                    {
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: "Yes", callback_data: "yes" }],
                          [{ text: "No", callback_data: "no" }],
                        ],
                      },
                    },
                  );
                });
            },
          );
        } else if (
          !userData.waitingForLongUrl &&
          userData.waitingForCustomizeUrl &&
          !userData.waitingForLongUrlForCustomizeUrl
        ) {
          userData.waitingForLongUrl = false;
          userData.waitingForCustomizeUrl = true;
          userData.waitingForLongUrlForCustomizeUrl = true;
          userData.customCode = text as string;
          await bot.sendMessage(
            chatId,
            "Provide the long url to be used for the customization",
          );
        } else if (
          !userData.waitingForLongUrl &&
          userData.waitingForCustomizeUrl &&
          userData.waitingForLongUrlForCustomizeUrl
        ) {
          let shortenerData = await this.ShortenerService.customize(
            userData.customCode,
            text as string,
          );
          await QRCode.toFile(
            qrCodePath,
            `http://localhost:8000/${
              (shortenerData as ShortenerInterface).short_url
            }`,
            {
              errorCorrectionLevel: "H",
            },
            function (err) {
              if (err) throw err;
              bot
                .sendPhoto(chatId, qrCodePath, {
                  caption: `This is the shortened url: http://localhost:8000/${
                    (shortenerData as ShortenerInterface).short_url
                  }`,
                })
                .then(() => {
                  bot.sendMessage(
                    chatId,
                    "Do you want to create another shortened url?",
                    {
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: "Yes", callback_data: "yes" }],
                          [{ text: "No", callback_data: "no" }],
                        ],
                      },
                    },
                  );
                });
            },
          );
        }
      } catch (error: any) {
        throw new Error(error);
      }
    }
  }
}

export default BotService;
