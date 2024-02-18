import express, { RequestHandler } from "express";
import { MySQLDBInterface } from "../db/mysql";
import { LocationDBInterface } from "../db/location";
import AnomalyDetectionService from "./anomalydetection/AnomalyDetectionService";

const router = express.Router()

export enum RouteMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

export type Route = {
  route: string;
  handler: RequestHandler;
  method: RouteMethods;
};

export function initServices(app: any, locationDB: LocationDBInterface, mysqlDB: MySQLDBInterface) {
  const anomalyDetectionService = new AnomalyDetectionService(locationDB, mysqlDB);

  [anomalyDetectionService].forEach((service) => {
    service.routes.forEach((route) => {
      router[route.method](route.route, route.handler);
    });
  });

  app.use('/', router);
}