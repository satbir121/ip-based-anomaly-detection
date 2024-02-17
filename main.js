const express = require('express')
// Get the client
const bodyParser = require('body-parser');
const { getLastIPAddress, insertLastIPAddress } = require('./db');
const { getDistanceFromLatLonInKm, calculateRiskScore } = require('./utils');
const Reader = require('@maxmind/geoip2-node').Reader;
// Typescript:
// import { Reader } from '@maxmind/geoip2-node';

const options = {
  // you can use options like `cache` or `watchForUpdates`
};

function getLatLong(IPAddress) {
  return new Promise((resolve, reject) => {
    Reader.open('./GeoLite2-City.mmdb').then(reader => {
      const response = reader.city(IPAddress);
      resolve({
        latitude: response.location.latitude,
        longitude: response.location.longitude
      })
    }).catch((error) => {
      reject(error);
    });
  })
}


const app = express()
const port = 3000

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
// Get the client

app.get('/', (req, res) => {
  console.log("request recieved ", req);
  res.send('Hello World!')
})

app.post('/check-for-anomaly', async (req, res) => {
  console.log('receiving data ...');
  console.log('body is ', req.body);
  const { userId, newIpAddress } = req.body;

  try {
    Promise.all([
      getLastIPAddress(userId, newIpAddress),
      getLatLong(newIpAddress)
    ]).then(async (values) => {
      const results = values[0];
      const { latitude, longitude } = values[1];
      let riskScore = 0;
      let message = undefined;
          // If there is no Ip address in the database, then just update it and return
      if(results.length === 0) {
        await insertLastIPAddress(userId, newIpAddress, latitude, longitude);
        riskScore = 0;
        message = "No IP address found in the database, so inserting the IP address";
      }
      // If there is an IP address, then check if the IP address is matching with the last IP address
      if(results[0].IPAddress === newIpAddress) {
        riskScore = 0;
        message = "The previous IP address was same as the one sent.";
      }
      // If not, then call the Third party service to get lat long.
      const distance = getDistanceFromLatLonInKm(latitude, longitude, results[0].LatLong.x, results[0].LatLong.y);
      // Check if the lat long are close to the last lat long
      const timeNowMinutes = (new Date()).getTime() / (1000 * 60);
      const lastLoginTimeMinutes = (new Date(results[0].timestamp)).getTime() / (1000 * 60);
      const timeElapsed = timeNowMinutes - lastLoginTimeMinutes;
      const timeElapsedInHours = timeElapsed/60;
  
      riskScore = calculateRiskScore(distance, timeElapsedInHours);
  
      const status = riskScore > 0.8 ? "ANOMALY_DETECTED" : "NO_ANOMALY_DETECTED";
  
      res.send({
        status: status,
        risk : riskScore,
        message: message || "The distance between two IP address: " + distance + " km. Time Elapsed: "+ (timeElapsed.toFixed(0)) + " mins"
      })
      return;
    });
  } catch (error) {
    res.status(500).send({
      status: "Internal Server Error",
      risk : 0,
      message: error.message
    })
    return;
  }
});



app.get('/anomalydetection/lastIPAddress', async (req, res) => {
    // execute will internally call prepare and query
    const [results, fields] = await connection.execute(
      'SELECT * FROM `IPHistory` WHERE `UserID` = ? AND `TenantID` = ?',
      ['Abc', 'def']
    );

    return results;
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
