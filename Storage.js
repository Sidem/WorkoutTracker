let workouts = getWorkouts();
let availableWeights = getAvailableWeights();
setAvailableWeights(availableWeights);

function getRecords() {
    return JSON.parse(localStorage.getItem('records')) || {};
}

function getWorkouts() {
    return JSON.parse(localStorage.getItem('workouts')) || {};
}

function getAvailableWeights() {
    return {
        b1000: { weight: 10, quantity: 1, name: "Barbell" },
        b750: { weight: 7.5, quantity: 1, name: "Barbell" },
        ezb650: { weight: 6.5, quantity: 1, name: "EZBar" },
        d250: { weight: 2.5, quantity: 2, name: "Dumbbell" },
        d200: { weight: 2, quantity: 4, name: "Dumbbell" },
        kbh250: { weight: 2.5, quantity: 1, name: "KettlebellHandle" },
        w2000: { weight: 20, quantity: 6, name: "Weight" },
        w1000: { weight: 10, quantity: 4, name: "Weight" },
        w500: { weight: 5, quantity: 12, name: "Weight" },
        w250: { weight: 2.5, quantity: 8, name: "Weight" },
        w200: { weight: 2, quantity: 4, name: "Weight" },
        w125: { weight: 1.25, quantity: 4, name: "Weight" },
        w100: { weight: 1, quantity: 8, name: "Weight" },
        r25: { weight: 0.25, quantity: 16, name: "Ring" }
    };
}

function setRecords(records) {
    localStorage.setItem('records', JSON.stringify(records));
}

function setWorkouts(workouts) {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

function setAvailableWeights(availableWeights) {
    localStorage.setItem('availableWeights', JSON.stringify(availableWeights));
}