import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import BotService from "@/resources/bot/bot.service";

class BotController {
  private TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
  public bot = new TelegramBot(this.TELEGRAM_BOT_TOKEN, { polling: true });
  private BotService = new BotService();

  public initializeBotListeners() {
    this.initialMessage();
    this.botListeners();
    this.botResponder();
    this.personaliser();
    this.shortener();
  }

  //Start Message
  private initialMessage = () => {
    this.BotService.initialMessage(this.bot);
  };

  private shortener = () => {
    this.BotService.shortenerService(this.bot);
  };

  private personaliser = () => {
    this.BotService.personalizeService(this.bot);
  };

  private botListeners = () => {
    this.bot.on("callback_query", async (callbackQuery: CallbackQuery) => {
      const chatId = callbackQuery.message?.chat.id as number;
      const data = callbackQuery.data as string;
      await this.BotService.listener(chatId, data, this.bot);
    });
  };

  private botResponder = () => {
    this.bot.on("message", async (msg: Message) => {
      const chatId = msg.chat.id as number;
      const text = msg.text as string;
      await this.BotService.responder(chatId, text, this.bot);
    });
  };
}

export default BotController;
