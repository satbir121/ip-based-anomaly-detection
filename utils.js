
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function calculateRiskScore(distance, timeElapsedInHours) {
    const strictScale = 1;
    const airTravelSpeed = 800; // km/hour
    const groundTravelSpeed = 120; // km/hour
    const distanceBuffer = 250;
    const adjustedgroundTravelSpeed = groundTravelSpeed + distanceBuffer/timeElapsedInHours; // km/hour
    const adjustedairTravelSpeed = airTravelSpeed + distanceBuffer/timeElapsedInHours; // km/hour
    
    const adjustedSpeed = (distance + distanceBuffer)/timeElapsedInHours ;

    // Base speed is 0.5 * 

    // Distance = 0, Time = 0.1, Base speed = 0 + 250/0.1 = 500
    // Distance = 0, Time = 8, Base speed = 0 + 250/8 = 31.25

    if (timeElapsedInHours < 0.5) {
      if (adjustedSpeed >= strictScale*adjustedgroundTravelSpeed) {
        riskScore = 1;
      } else if( adjustedSpeed < strictScale*adjustedgroundTravelSpeed && adjustedSpeed >= adjustedgroundTravelSpeed ) {
        riskScore = adjustedSpeed/(adjustedgroundTravelSpeed * strictScale);
      } else {
        riskScore = 0.1;
      }
    } else if (timeElapsedInHours >= 0.5 && timeElapsedInHours < 8) {
      if (adjustedSpeed >= strictScale*adjustedairTravelSpeed) {
        riskScore = 1;
      } else if( adjustedSpeed < strictScale*adjustedairTravelSpeed && adjustedSpeed >= adjustedairTravelSpeed ) {
        riskScore = adjustedSpeed/(adjustedairTravelSpeed * strictScale);
      } else {
        riskScore = 0.1;
      }
    } else {
      // InConclusive. TODO: More research needed.
      riskScore = 0.5;
    }
    return riskScore
}

module.exports = {
    getDistanceFromLatLonInKm,
    calculateRiskScore
}