let workouts = {};
let changeHappened = [false, false, false, false];
let availableWeights = getAvailableWeights();
setAvailableWeights(availableWeights);
const serverUrl	= 'https://192.168.0.88:6969';
let connected = false;
const dataTypes = ['workouts', 'records', 'measurementRecords', 'availableWeights'];
setInterval(syncData, 1000);

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
    changeHappened = [false, false, false, false];
    try {
        const healthCheckResponse = await fetch(`${serverUrl}/health`);
        if (!healthCheckResponse.ok) {
            throw new Error('Server is not reachable');
        } else {
            connected = true;
        }
    } catch (error) {
        console.error('Server is not reachable, aborting function:', error);
        workouts = getWorkouts();
        connected = false;
        return;
    }

    if (!getUsername()) {
        setUsername(customPrompt("Please enter your username:", "TestUser"));
    }
    const username = getUsername();
    for (const dataType of dataTypes) {
        const response = await fetch(`${serverUrl}?username=${username}&dataType=${dataType}`);
        const data = await response.json();
        if (Object.keys(data).length > 0) {
            localStorage.setItem(dataType, JSON.stringify(data));
        } else {
            await fetch(`${serverUrl}?username=${username}&dataType=${dataType}`, {
                method: 'POST',
                body: JSON.stringify(getDataType(dataType))
            });
        }
    }
    workouts = getWorkouts();
}

function syncData() {
    if (!connected) {
        return;
    }
    const username = getUsername();
    for (const dataType of dataTypes) {
        if (changeHappened[dataTypes.indexOf(dataType)]) {
            fetch(`${serverUrl}?username=${username}&dataType=${dataType}`, {
                method: 'POST',
                body: JSON.stringify(getDataType(dataType))
            });
            changeHappened[dataTypes.indexOf(dataType)] = false;
        }
    }
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


function setWorkouts(workouts) {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    changeHappened[0] = true;
}

function setRecords(records) {
    localStorage.setItem('records', JSON.stringify(records));
    changeHappened[1] = true;
}

function setMeasurementRecords(measurementRecords) {
    localStorage.setItem('measurementRecords', JSON.stringify(measurementRecords));
    changeHappened[2] = true;
}

function setAvailableWeights(availableWeights) {
    localStorage.setItem('availableWeights', JSON.stringify(availableWeights));
    changeHappened[3] = true;
}

function clearData() {
    let username = getUsername();
    localStorage.clear();
    setUsername(username);
}