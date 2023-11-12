import * as process from "process";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import * as mongoose from "mongoose";
import ErrorHandlerMiddleware from "@/middleware/error.middleware";
import { Controller } from "@/utils/interfaces/controller.interface";
import ShortenerController from "@/resources/shortener/shortener.controller";
import BotController from "@/resources/bot/bot.controller";

class App {
  private express: Application;
  private readonly port: number;
  private Shortener = new ShortenerController();

  private bot = new BotController()

  constructor(controllers: Controller[], port: number) {
    this.express = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeRedirectRouter();
    this.initializeDatabaseConnection();
    this.initializeBot()
    this.initializeErrorHandler();
  }

  public listen(): void {
    this.express.listen(this.port, () =>
      console.log(
        `INFO App listening on port ${this.port} \nINFO Initializing DB connection`,
      ),
    );
  }

  private initializeMiddlewares(): void {
    this.express.use(cors());
    this.express.use(helmet());
    this.express.use(morgan("dev"));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
  }


  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller: Controller) => {
      this.express.use("/api", controller.router);
    });
  }

  private initializeRedirectRouter(): void {
    this.express.use("/:shortCode", this.Shortener.router);
  }

  private initializeDatabaseConnection(): void {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    mongoose
      .connect(
        `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}/?retryWrites=true&w=majority`,
      )
      .then(() => console.log(`INFO DB connection successfully initialized`))
      .catch(() => console.log("ERROR DB connection initialization failed"));
  }

  private initializeBot(): void {
    this.bot.initializeBotListeners()
  }

  private initializeErrorHandler(): void {
    // @ts-ignore
    this.express.use(ErrorHandlerMiddleware);
  }
}

export default App;
