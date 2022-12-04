// npm i -D typescript ts-node nodemon
// tsc --init
// npm i express
// npm i -D @types/express
// npm i express-validation --save

import express, { Express } from "express";
import { routes } from "./routes/routes";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

routes(app);

app.listen(3000, () => {
  console.log("Listening on port: 8000");
});
