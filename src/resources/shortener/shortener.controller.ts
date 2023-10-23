import { NextFunction, Request, Response, Router } from "express";
import * as process from "process";
import { Controller } from "@/utils/interfaces/controller.interface";
import validationMiddleware from "@/middleware/validation.middleware";
import validation from "@/resources/shortener/shortener.validation";
import ShortenerService from "@/resources/shortener/shortener.service";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";

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
    this.router.get(`/`, this.redirect);
  }

  private generate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Error | void> => {
    try {
      const { long_url } = await req.body;
      const url_data = (await this.ShortenerService.generate(
        long_url,
      )) as ShortenerInterface;
      res.status(201).json({
        message: "URL successfully shorted",
        short_url: `${process.env.BASE_URL}/${url_data.short_url}`,
        long_url: `${process.env.BASE_URL}/${url_data.long_url}`,
      });
    } catch (e) {
      next(new HttpException(500, "Something went wrong"));
    }
  };

  private redirect = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Error | void> => {
    try {
      const pathname = req.originalUrl.substring(1);
      const url = (await this.ShortenerService.redirect(
        pathname,
      )) as ShortenerInterface;
      res.status(301).redirect(`${url.long_url}`);
    } catch (error: any) {
      console.log(error);
    }
  };
}

export default ShortenerController;
