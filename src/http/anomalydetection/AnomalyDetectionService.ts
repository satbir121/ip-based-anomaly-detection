import { Request, Response } from "express";
import { Route, RouteMethods } from "..";
import { LocationDBInterface } from "../../db/location";
import { MySQLDBInterface } from "../../db/mysql";
import AnomalyDetection from "../../domain/AnomalyDetection";

interface Service {
  routes: Route[];
}

export default class AnomalyDetectionService implements Service {
  private anomalyDetectionInstance: AnomalyDetection;
  constructor(locationDB: LocationDBInterface, mysqlDB: MySQLDBInterface) {
    this.anomalyDetectionInstance = new AnomalyDetection(locationDB, mysqlDB);
  }
  routes = [
    {
      route: "/check-for-anomaly",
      method: RouteMethods.POST,
      handler: async (req: Request, res: Response) => {
          if(!req.body.userId || !req.body.newIpAddress) {
            res.status(400).send({error: "userId and newIpAddress are required"});
            return;
          }
          try {
            const { userId, newIpAddress } = req.body;
            const anomalyData = await this.anomalyDetectionInstance.checkForAnomaly(userId, newIpAddress);
            //TODO: Collect data and send it to another service
            res.send(anomalyData);
            return;
          } catch (error) {
            res.status(500).send({ error: error });
            return;
          }
      },
    }
  ]
}