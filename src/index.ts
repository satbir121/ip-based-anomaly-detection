import express, { Express } from "express";
import { initServices } from "./http";
import { LocationDB } from "./db/location";
import { MySQLDB } from "./db/mysql";

// Get the client
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

const port = process.env["PORT"] || 3000;
const mysqlHost = process.env["MYSQL_HOST"] || "";
const mysqlUser = process.env["MYSQL_USER"] || "";
const mysqlDatabase = process.env["MYSQL_DATABASE"] || "";
const mysqlPassword = process.env["MYSQL_PASSWORD"] || "";


const locationDB = new LocationDB();
const mysqlDB = new MySQLDB(mysqlHost, mysqlUser, mysqlDatabase, mysqlPassword);


const app: Express = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

initServices(app, locationDB, mysqlDB);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
