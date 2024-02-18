import AnomalyDetection from "../src/domain/AnomalyDetection";

const totalElements = 1000
const timeElapsedArray = [...Array(totalElements).keys()].map((i) => i * 0.01);
const distanceArray = [...Array(totalElements).keys()].map((i) => i * 2);;

type FalseResults = {
    timeElapsed: number;
    riskScore: number;
    distance: number;
}

const results = []
for(let i = 0; i < timeElapsedArray.length; i++) {
    let riskScores = [];
    const timeElapsed = timeElapsedArray[i] || -1;
    for(let j = 0; j < distanceArray.length; j++) {
        const distance = distanceArray[j] || -1;
        riskScores.push(AnomalyDetection.calculateRiskScore(distance, timeElapsed));
    }
    results.push({
        timeElapsed,
        riskScores
    });
}

const potentialFalsePositives: FalseResults[] = [];
const potentialFalseNegatives: FalseResults[] = [];
results.forEach((result) => {
    const timeElapsed = result.timeElapsed;
    result.riskScores.forEach((riskScore, index) => {
        if(riskScore > 0.8) {
            const distance = distanceArray[index] || -1;
            const speed = distance/timeElapsed;
            if(speed < 500) {
                potentialFalsePositives.push({
                    timeElapsed: timeElapsed,
                    riskScore: riskScore,
                    distance: distance
                })
            }
        }
    });

    result.riskScores.forEach((riskScore, index) => {
        if(riskScore < 0.2) {
            const distance = distanceArray[index] || -1;
            const speed = distance/timeElapsed;
            if(speed > 750) {
                potentialFalseNegatives.push({
                    timeElapsed: timeElapsed,
                    riskScore: riskScore,
                    distance: distance
                })
            }
        }
    });

    // if(timeElapsed < 0.5) {
    //     result.riskScores.forEach((riskScore, index) => {
    //         if(riskScore < 0.9) {
    //            wrongRiskScores.push({
    //             timeElapsed: timeElapsed,
    //             riskScore: riskScore,
    //             distance: distanceArray[index]
    //            });
    //         }
    //     });
    // } else if (timeElapsed >= 0.5 && timeElapsed < 8) {
    //     result.riskScores.forEach((riskScore, index) => {
    //         if(riskScore < 0.5) {
    //            wrongRiskScores.push({
    //             timeElapsed: timeElapsed,
    //             riskScore: riskScore,
    //             distance: distanceArray[index]
    //            });
    //         }
    //     });
    // } else if (timeElapsed > 8) {
    //     result.riskScores.forEach((riskScore, index) => {
    //         if(riskScore !== 0.5) {
    //            wrongRiskScores.push({
    //             timeElapsed: timeElapsed,
    //             riskScore: riskScore,
    //             distance: distanceArray[index]
    //            });
    //         }
    //     });
    // }
})

console.log(potentialFalsePositives, potentialFalseNegatives)
