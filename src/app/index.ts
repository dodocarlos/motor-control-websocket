import AWSXRay from 'aws-xray-sdk';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import errorHandler from './middleware/errorHandler';
import routes from './routes';

class App {
  public server: Express;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.errors();
  }

  routes() {
    this.server.use(routes);
  }

  middlewares() {
    this.server.use(helmet());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(AWSXRay.express.openSegment('MotorControl'));
  }

  errors() {
    this.server.use(errorHandler);
    this.server.use(AWSXRay.express.closeSegment());
  }
}

export default new App().server;
