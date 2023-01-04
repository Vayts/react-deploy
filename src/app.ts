import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import mongoose, {ConnectOptions} from "mongoose";

dotenv.config();

export class App {
  app: express.Application;

  constructor(controllers: any) {
    this.app = express();

    this.settings();
    this.middlewares();
    this.routes();
    this.api();
    this.controllers(controllers);
  }

  settings() {
    this.app.set('port', process.env.PORT || 8020);
  }
  
  api() {
    mongoose.connect(<string>process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
      .then(() => {
        console.log('connect to db')
      }).catch((err) => {
      console.log('error', err)
    })
  }

  middlewares() {
    this.app.use(cors({
      credentials: true,
      origin: ['http://localhost:4200', 'https://boring-design-app.herokuapp.com']
    }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }
  
  routes() {
    this.app.use(express.static('./web'));
    this.app.use('/photo', express.static('./web/static/media'));
    this.app.use('/static', express.static('./web/static/js'));
  }

  controllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use(controller.path, controller.router);
    });
  }

  start() {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server on http://localhost:${this.app.get('port')}`);
    });

  }
}

