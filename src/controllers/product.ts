import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../index";
import { Product } from "../entity/product.pagination";
import { FindOptionsSelect } from "typeorm";

export const GetProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productsRepository = await AppDataSource.getRepository(Product);
  let queryResults;
  let selected, count;
  let sorted, count2;

  // if (JSON.stringify(req.query) !== "{}") {
  if (req.query.select) {
    const reqQuery = { ...req.query };

    let reqQuerySelected = reqQuery["select"] as string;
    reqQuerySelected = reqQuerySelected.replace(/,/g, " ");

    let arr = reqQuerySelected.split(" ");

    if (arr.length === 1) {
      [selected, count] = await productsRepository.findAndCount({
        select: [arr[0] as keyof Product],
      });
    } else if (arr.length === 2) {
      [selected, count] = await productsRepository.findAndCount({
        select: [arr[0] as keyof Product, arr[1] as keyof Product],
      });
    } else if (arr.length === 3) {
      [selected, count] = await productsRepository.findAndCount({
        select: [
          arr[0] as keyof Product,
          arr[1] as keyof Product,
          arr[2] as keyof Product,
        ],
      });
    }
  }

  if (req.query.sort) {
    [sorted, count2] = await productsRepository.findAndCount({
      order: {
        price: "ASC"
      }
    });
  }

  const take = 2; // This is the amount of results per page shown
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

  if (selected) {
    return res.send({
      count: count,
      selected,
    });
  }

  if (sorted) {
    return res.send({
      count: count2,
      sorted
    })
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
