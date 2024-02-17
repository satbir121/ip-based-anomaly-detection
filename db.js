const mysql = require('mysql2/promise');

let connection = undefined
 mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'anomalyDB',
    password: 'password',
  }).then((conn) => {
    connection = conn;
  })

const getLastIPAddress = async (userId) => {
    try {
        const [results, fields] = await connection.execute(
            'SELECT * FROM `IPHistory` WHERE `UserID` = ?',
            [userId]
          );
            return results;
    }   catch (error) {
        console.log('error is ', error);
    }
}

const insertLastIPAddress = async (userId, newIpAddress, lat, long) => {
    const [results, fields] = await connection.execute(
        'INSERT INTO `IPHistory` (UserID, IPAddress, LatLong) VALUES (?,?,Point(?,?))',
        [userId, newIpAddress, lat, long]
      );
        return results;
}

const updateLastIPAddress = async (userId, lat, long, newIpAddress) => {
    const [results, fields] = await connection.execute(
        "UPDATE `IPHistory` SET IPAddress = '?' LatLong = 'Point(?,?)' WHERE UserID = ?",
        [newIpAddress, lat, long, userId]
      );
        return results;
}
  
module.exports = {
    getLastIPAddress,
    insertLastIPAddress
}