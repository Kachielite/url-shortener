import { Controller } from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import validationMiddleware from "@/middleware/validation.middleware";
import validation from "@/resources/shortener/shortener.validation";
import ShortenerService from "@/resources/shortener/shortener.service";
import * as process from "process";

class ShortenerController implements Controller {
  public path = "/generate";
  public router = Router();
  private ShortenerService = new ShortenerService();

  constructor() {
    this.initializeRouters();
  }

  private initializeRouters() {
    this.router.post(
      `${this.path}`,
      validationMiddleware(validation.generate),
      this.generate,
    );
  }

  private generate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { long_url } = await req.body;
      const url_data = this.ShortenerService.generate(long_url);
      res.status(201).json({
        message: "URL successfully shorted",
        short_url: `${process.env.BASE_URL}/${url_data}`,
      });
    } catch (e) {
      next(new HttpException(500, "Something went wrong"));
    }
  };
}

export default ShortenerController;
