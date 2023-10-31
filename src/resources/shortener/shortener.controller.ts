import * as process from "process";
import { NextFunction, Request, Response, Router } from "express";
import { Controller } from "@/utils/interfaces/controller.interface";
import validationMiddleware from "@/middleware/validation.middleware";
import validation from "@/resources/shortener/shortener.validation";
import ShortenerService from "@/resources/shortener/shortener.service";
import { ShortenerInterface } from "@/resources/shortener/shortener.interface";

class ShortenerController implements Controller {
  public path = "/shortener";
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
    this.router.post(
      `${this.path}/customize`,
      validationMiddleware(validation.customize),
      this.customize,
    );
    this.router.get(`${this.path}`, this.getAll);
    this.router.delete(`${this.path}`, this.delete);
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

  private customize = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Error | void> => {
    try {
      const { custom_code, long_url } = await req.body;
      const url_data = await this.ShortenerService.customize(
        custom_code,
        long_url,
      );
      res.status(201).json({
        message: "URL successfully shorted",
        short_url: `${process.env.BASE_URL}/${url_data.short_url}`,
        long_url: `${process.env.BASE_URL}/${url_data.long_url}`,
      });
    } catch (error: any) {
      console.log(error);
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
      next(new HttpException(500, error.message || "Something went wrong"));
    }
  };

  private getAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Error | void> => {
    try {
      const pageNumber = req.query.page;
      const allData = await this.ShortenerService.getAll(
        parseInt(pageNumber as string),
      );
      res.status(200).json({ allData });
    } catch (error: any) {
      console.log(error);
      next(new HttpException(500, error.message || "Something went wrong"));
    }
  };

  private delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Error | void> => {
    try {
      const { ids } = req.body;
      await this.ShortenerService.delete(ids);
      res
        .status(200)
        .json({ message: "Successfully deleted urls", deleted_url: ids });
    } catch (error: any) {
      console.log(error);
      next(new HttpException(500, error.message || "Something went wrong"));
    }
  };
}

export default ShortenerController;
