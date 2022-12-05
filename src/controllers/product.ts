import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../index";
import { Product } from "../entity/product.pagination";

export const GetProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productsRepository = await AppDataSource.getRepository(Product);

  const take = 1; // This is the amount of results per page shown
  const page = parseInt((req.query.page as string) || "1");

  const startIndex = (page - 1) * take;
  const endIndex = page * take;

  const pagination = {
    next: undefined,
    prev: undefined,
  };

  const [data, total] = await productsRepository.findAndCount({
    take,
    skip: (page - 1) * take,
  });

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: take,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: take,
    };
  }

  res.send({
    count: total,
    // pagination: {
    //   page,
    //   last_page: Math.ceil(total / take),
    // },
    pagination,
    data,
  });
};
