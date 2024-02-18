import { LocationDBInterface } from "../db/location";
import { MySQLDBInterface } from "../db/mysql";

export default class AnomalyDetection {
  locationDB: LocationDBInterface;
  mysqlDB: MySQLDBInterface;
  constructor(locationDB: LocationDBInterface, mysqlDB: MySQLDBInterface) {
    this.locationDB = locationDB;
    this.mysqlDB = mysqlDB;
  }
  // TODO: Add tests for this function
  async checkForAnomaly(userId: string, newIpAddress: string) {
    try {
      const { latitude, longitude } = this.locationDB.getLocationBasedOnIPAddress(newIpAddress);
      const ipAddressLog = await this.mysqlDB.getLastIPAddressLog(userId);

      let riskScore = 0;
      let status = "";
      let message = undefined;
      // If there is no Ip address in the database, then just update it and return
      // TODO: remove the hard coded value of 0
      if (ipAddressLog === undefined) {
        await this.mysqlDB.insertLastIpAddressLog(userId, newIpAddress, latitude, longitude);
        riskScore = 0;
        message = "No IP address found in the database, so inserting the IP address";
      } else {
        if (ipAddressLog.IPAddress === newIpAddress) {
          riskScore = 0;
          message = "The previous IP address was same as the one sent.";
        }
        // If the Ip address is neither same nor it is a new signin, then call the Third party service to get lat long.
        const distance = AnomalyDetection.getDistanceFromLatLonInKm(
          latitude,
          longitude,
          ipAddressLog.LatLong.x,
          ipAddressLog.LatLong.y
        );
        // Check if the lat long are close to the last lat long
        const timeNowMinutes = new Date().getTime() / (1000 * 60);
        const lastLoginTimeMinutes = new Date(ipAddressLog.timestamp).getTime() / (1000 * 60);
        const timeElapsed = timeNowMinutes - lastLoginTimeMinutes;
        const timeElapsedInHours = timeElapsed / 60;

        riskScore = AnomalyDetection.calculateRiskScore(distance, timeElapsedInHours);

        // Update the new IP address in the database
        // TODO: This risk score is hard coded. It should be a configurable value.
        if (riskScore < 0.8) {
          await this.mysqlDB.updateLastIPAddressLog(userId, newIpAddress, latitude, longitude);
        }
        message =
          "Distance is " + distance + " and time elapsed is " + timeElapsed + " hours. Risk score is " + riskScore;
      }

      // If there is an IP address, then check if the IP address is matching with the last IP address
      status = riskScore > 0.8 ? "ANOMALY_DETECTED" : "NO_ANOMALY_DETECTED";

      return {
        status,
        riskScore,
        message,
      };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
  private static getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = AnomalyDetection.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = AnomalyDetection.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(AnomalyDetection.deg2rad(lat1)) *
        Math.cos(AnomalyDetection.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  private static deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
  // TODO: Add tests for this function
  static calculateRiskScore(distance: number, timeElapsedInHours: number) {
    const strictScale = 1;
    const airTravelSpeed = 800; // km/hour
    const groundTravelSpeed = 120; // km/hour
    const distanceBuffer = 250;
    const adjustedgroundTravelSpeed = groundTravelSpeed + distanceBuffer / timeElapsedInHours; // km/hour
    const adjustedairTravelSpeed = airTravelSpeed + distanceBuffer / timeElapsedInHours; // km/hour

    const adjustedSpeed = (distance + distanceBuffer) / timeElapsedInHours;

    let riskScore = 0;
    // Base speed is 0.5 *

    // Distance = 0, Time = 0.1, Base speed = 0 + 250/0.1 = 500
    // Distance = 0, Time = 8, Base speed = 0 + 250/8 = 31.25

    if (timeElapsedInHours < 0.5) {
      if (adjustedSpeed >= strictScale * adjustedgroundTravelSpeed) {
        riskScore = 1;
      } else if (
        adjustedSpeed < strictScale * adjustedgroundTravelSpeed &&
        adjustedSpeed >= adjustedgroundTravelSpeed
      ) {
        riskScore = adjustedSpeed / (adjustedgroundTravelSpeed * strictScale);
      } else {
        riskScore = 0.1;
      }
    } else if (timeElapsedInHours >= 0.5 && timeElapsedInHours < 8) {
      if (adjustedSpeed >= strictScale * adjustedairTravelSpeed) {
        riskScore = 1;
      } else if (adjustedSpeed < strictScale * adjustedairTravelSpeed && adjustedSpeed >= adjustedairTravelSpeed) {
        riskScore = adjustedSpeed / (adjustedairTravelSpeed * strictScale);
      } else {
        riskScore = 0.1;
      }
    } else {
      // InConclusive. TODO: More research needed.
      riskScore = 0.5;
    }
    return riskScore;
  }
}
