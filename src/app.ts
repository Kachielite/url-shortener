import * as process from "process";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import * as mongoose from "mongoose";
import ErrorHandlerMiddleware from "@/middleware/error.middleware";
import { Controller } from "@/utils/interfaces/controller.interface";

class App {
  private express: Application;
  private readonly port: number;

  constructor(controllers: Controller[], port: number) {
    this.express = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeDatabaseConnection();
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

  private initializeDatabaseConnection(): void {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    mongoose
      .connect(
        `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}/?retryWrites=true&w=majority`,
      )
      .then(() => console.log(`INFO DB connection successfully initialized`))
      .catch(() => console.log("ERROR DB connection initialization failed"));
  }

  private initializeErrorHandler(): void {
    // @ts-ignore
    this.express.use(ErrorHandlerMiddleware);
  }
}

export default App;
