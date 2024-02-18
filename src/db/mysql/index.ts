const mysql = require("mysql2/promise");

export type IpAddressLog = {
  UserID: string;
  TenantID: string;
  IPAddress: string;
  LatLong: {
    x: number;
    y: number;
  };
  timestamp: number;
};

export interface MySQLDBInterface {
  getLastIPAddressLog: (userId: string) => Promise<IpAddressLog>;
  insertLastIpAddressLog: (userId: string, newIpAddress: string, lat: number, long: number) => Promise<IpAddressLog>;
  updateLastIPAddressLog: (userId: string, newIpAddress: string, lat: number, long: number) => Promise<IpAddressLog>;
}

export class MySQLDB implements MySQLDBInterface {
  private connection?: any;

  constructor(host: string, user: string, database: string, password: string) {
    mysql
      .createConnection({
        host: host,
        user: user,
        database: database,
        password: password,
      })
      .then((conn: any) => {
        this.connection = conn;
      });
  }
  async getLastIPAddressLog(userId: string) {
    if (!this.connection) {
      throw new Error("Connection not initialized");
    }

    try {
      const [results] = await this.connection.execute("SELECT * FROM `LastIPAddress` WHERE `UserID` = ?", [userId]);
      return results[0];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async insertLastIpAddressLog(userId: string, newIpAddress: string, lat: number, long: number) {
    if (!this.connection) {
      throw new Error("Connection not initialized");
    }
    try {
      const [results] = await this.connection.execute(
        "INSERT INTO `LastIPAddress` (UserID, IPAddress, LatLong) VALUES (?,?,Point(?,?))",
        [userId, newIpAddress, lat, long]
      );
      return results[0];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateLastIPAddressLog(userId: string, newIpAddress: string, lat: number, long: number) {
    if (!this.connection) {
      throw new Error("Connection not initialized");
    }
    try {
      const [results] = await this.connection.execute(
        "UPDATE `LastIPAddress` SET IPAddress = '?', LatLong = Point(?,?) WHERE UserID = '?'",
        [ newIpAddress, lat, long, userId]
      );
      return results[0];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
