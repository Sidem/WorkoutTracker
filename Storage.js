let workouts = getWorkouts();
let availableWeights = getAvailableWeights();
setAvailableWeights(availableWeights);
const serverUrl	= 'http://192.168.0.88:6969';

function getDataType(dataType) {
    switch (dataType) {
        case 'workouts':
            return getWorkouts();
        case 'records':
            return getRecords();
        case 'measurementRecords':
            return getMeasurementRecords();
        case 'availableWeights':
            return getAvailableWeights();
    }
}

async function logIntoHomeNetwork() {
    
    try {
        const healthCheckResponse = await fetch(`${serverUrl}/health`);
        if (!healthCheckResponse.ok) {
            throw new Error('Server is not reachable');
        }
    } catch (error) {
        console.error('Server is not reachable, aborting function:', error);
        return;
    }

    if (!getUsername()) {
        setUsername(customPrompt("Please enter your username:", "TestUser"));
    }
    const username = getUsername();
    const dataTypes = ['workouts', 'records', 'measurementRecords', 'availableWeights'];
    for (const dataType of dataTypes) {
        const response = await fetch(`${serverUrl}?username=${username}&dataType=${dataType}`);
        const data = await response.json();
        if (Object.keys(data).length > 0) {
            switch (dataType) {
                case 'workouts':
                    setWorkouts(data);
                    break;
                case 'records':
                    setRecords(data);
                    break;
                case 'measurementRecords':
                    setMeasurementRecords(data);
                    break;
                case 'availableWeights':
                    setAvailableWeights(data);
                    break;
            }
        } else {
            await fetch(`${serverUrl}?username=${username}&dataType=${dataType}`, {
                method: 'POST',
                body: JSON.stringify(getDataType(dataType))
            });
        }
    }
    workouts = getWorkouts();
}

function setUsername(username) {
    localStorage.setItem('username', username);
}

function getUsername() {
    return localStorage.getItem('username');
}

function getRecords() {
    return JSON.parse(localStorage.getItem('records')) || {};
}

function getMeasurementRecords() {
    return JSON.parse(localStorage.getItem('measurementRecords')) || {};
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

function setMeasurementRecords(measurementRecords) {
    localStorage.setItem('measurementRecords', JSON.stringify(measurementRecords));
}

function setWorkouts(workouts) {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

function setAvailableWeights(availableWeights) {
    localStorage.setItem('availableWeights', JSON.stringify(availableWeights));
}

function clearData() {
    let username = getUsername();
    localStorage.clear();
    setUsername(username);
}