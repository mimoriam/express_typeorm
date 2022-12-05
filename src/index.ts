// npm i -D typescript ts-node nodemon
// tsc --init
// npm i express
// npm i -D @types/express @types/node
// npm i express-validation --save

// npm install typeorm reflect-metadata --save
// npm install pg --save

// npm i bcryptjs
// npm i -D @types/bcryptjs

// npm i jsonwebtoken
// npm i -D @types/jsonwebtoken

// npm i cookie-parser
// npm i -D @types/cookie-parser

// npm i dotenv

// npm i nodemailer
// npm i -D @types/nodemailer

// npm i speakeasy

import express, { Express } from "express";
import { routes } from "./routes/routes";
import { DataSource } from "typeorm";
import { User } from "./entity/user.entity";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import "reflect-metadata";
import { Role } from "./entity/role.entity";
import { Permission } from "./entity/permission.entity";
import { ForgotPass } from "./entity/forgot.entity";
import { Product } from "./entity/product.pagination";
import { Order } from "./entity/order.entity";

// Load env vars:
dotenv.config({ path: "./config/config.env" });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "node_admin",
  entities: [User, Role, Permission, ForgotPass, Product, Order],
  logging: false,
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    const app: Express = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    routes(app);

    app.listen(3000, () => {
      console.log("Listening on port: 8000");
    });
  })
  .catch((error) => console.log(error));
