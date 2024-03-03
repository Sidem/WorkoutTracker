let workouts = JSON.parse(localStorage.getItem('workouts')) || {};
let selectedWorkout = '';

let availableWeights = JSON.parse(localStorage.getItem('availableWeights')) || {
    b750:{weight:7.5,quantity:1,name:"Barbell"},
    b1000:{weight:10,quantity:1,name:"Barbell"},
    ezb650:{weight:6.5,quantity:1,name:"EZBar"},
    d200:{weight:2,quantity:4,name:"Dumbbell"},
    d250:{weight:2.5,quantity:2,name:"Dumbbell"},
    w2000:{weight:20,quantity:6,name:"Weight"},
    w1000:{weight:10,quantity:4,name:"Weight"},
    w500:{weight:5,quantity:12,name:"Weight"},
    w250:{weight:2.5,quantity:8,name:"Weight"},
    w200:{weight:2,quantity:4,name:"Weight"},
    w125:{weight:1.25,quantity:4,name:"Weight"},
    w100:{weight:1,quantity:8,name:"Weight"},
    r25:{weight:0.25,quantity:16,name:"Ring"}
};

localStorage.setItem('availableWeights', JSON.stringify(availableWeights)); 

let usedWeights = {};
let availableWorkoutWeights = {};
let workoutExercises = {};
let selectedExercise = '';
let weightsCollapsed = false;
let weightAdjustDisabled = true;
let currentReuse = 'none';

document.addEventListener('DOMContentLoaded', () => {
    listWorkouts();
    displayWorkout();
});

function createWorkoutButton(workout, workoutsContainer) {
    const button = document.createElement('button');
    button.textContent = workouts[workout].name;
    button.onclick = function () { selectWorkout(workout); };
    button.name = workout;
    button.classList.add('button');
    button.classList.add('workoutButton');
    workoutsContainer.appendChild(button);
}
function createAddButton(id, onclick) {
    const existingButton = document.getElementById(id);
    if (existingButton) {
        existingButton.remove();
    }
    const button = document.createElement('button');
    button.textContent = '➕';
    button.onclick = onclick;
    button.id = id;
    button.classList.add('addButton');
    button.classList.add('button');
    return button;
}
function listWorkouts() {
    const workoutsContainer = document.getElementById('workouts');
    workoutsContainer.innerHTML = '';
    Object.keys(workouts).forEach(workout => { createWorkoutButton(workout, workoutsContainer); });
    workoutsContainer.appendChild(createAddButton('addWorkout', () => {addWorkout();}));
}
function displayWorkout() {
    if (selectedWorkout != '') {
        document.getElementById('workoutTitle').innerText = workouts[selectedWorkout].name;
        displayExerciseButtons();
        displayDeleteButton('workout_delete', document.getElementById('workout'), () => {deleteWorkout();});
        displayWeights();
        displayRecords();
        document.getElementById('workout').style.display = 'block';
    } else {
        clearCurrentWorkout();
        document.getElementById('workout').style.display = 'none';
    }
}
function displayDeleteButton(buttonId, container, onclick) {
    const deleteButton = document.getElementById(buttonId);
    if (deleteButton) {
        deleteButton.remove();
    }
    const button = document.createElement('button');
    button.textContent = '✖️';
    button.onclick = onclick;
    button.id = buttonId;
    button.classList.add('deleteButton');
    button.classList.add('button');
    container.appendChild(button);
}

function displayExerciseButton(exercise, exercisesList) {
    let exerciseId = exercise;
    exercise = workoutExercises[exercise];
    const exerciseContainer = document.createElement('div');
    exerciseContainer.classList.add('exercise');
    exerciseContainer.classList.add('button');
    exerciseContainer.id = exerciseId + "_exercise";
    exerciseContainer.innerHTML = `<span class='exercise-name'>${exercise.name}</span>`;
    displayDeleteButton(exerciseId + '_delete', exerciseContainer, () => { deleteExercise(exerciseId, exercise); });
    exerciseContainer.onclick = function () { selectExercise(exerciseId); };
    exercisesList.appendChild(exerciseContainer);
}
function displayExerciseButtons() {
    const exercisesList = document.getElementById('exercises');
    exercisesList.innerHTML = '';
    for (let exercise in workoutExercises) {
        displayExerciseButton(exercise, exercisesList);
    }
    exercisesList.appendChild(createAddButton('addExercise', () => {addExercise();}));
}
function selectWorkout(workout) {
    selectedWorkout = workout;
    selectedExercise = '';
    workoutExercises = workouts[workout].exercises;
    getRemainingAvailableWeights();
    displayWorkout();
}
function reload() {
    workouts = JSON.parse(localStorage.getItem('workouts'));
    availableWeights = JSON.parse(localStorage.getItem('availableWeights')) || {};
    workoutExercises = selectedWorkout == '' ? {} : workouts[selectedWorkout].exercises;
    listWorkouts();
}
function clearCurrentWorkout() {
    document.getElementById('workoutTitle').innerText = 'Select a workout';
    document.getElementById('exercises').innerText = '';
}

function calculateTotalWeight(weights) {
    let totalUsedWeight = 0;
    for (let weight in weights) {
        totalUsedWeight += weights[weight].weight * weights[weight].quantity;
    }
    return totalUsedWeight;
}
function convertKgToLbs(kg) {
    return (kg * 2.20462).toFixed(1);
}
function getRemainingAvailableWeights() {
    let availableWorkoutWeights = JSON.parse(localStorage.getItem('availableWeights'));
    let totalUsedWeights = {};
    for (let exercise in workoutExercises) {
        let weights = workoutExercises[exercise].weights;
        for (let weight in weights) {
            if (totalUsedWeights[weight]) {
                totalUsedWeights[weight] += weights[weight].quantity;
            } else {
                totalUsedWeights[weight] = weights[weight].quantity;
            }
        }
    }
    return Object.keys(availableWorkoutWeights).map(weightKey => ({
        id: weightKey,
        name: availableWorkoutWeights[weightKey].name,
        weight: availableWorkoutWeights[weightKey].weight,
        available: availableWorkoutWeights[weightKey].quantity,
        used: totalUsedWeights[weightKey] || 0
    })).sort((a, b) => b.used - a.used);
}

function addCollapseHeader(container, collapseTarget, title) {
    const collapseExpandButton = document.createElement('span');
    collapseExpandButton.classList.add('collapse-expand-button');
    collapseExpandButton.textContent = weightsCollapsed ? '🔼' : '🔽';
    if(weightsCollapsed) collapseTarget.classList.add('collapsed');
    else collapseTarget.classList.remove('collapsed');
    const header = document.createElement('span');
    header.classList.add('header');
    header.textContent = title;
    const headerContainer = document.createElement('div');
    headerContainer.onclick = function () {
        if(weightsCollapsed) {
            collapseTarget.classList.remove('collapsed');
            collapseExpandButton.textContent = '🔽';
            weightsCollapsed = false;
        } else {
            collapseTarget.classList.add('collapsed');
            collapseExpandButton.textContent = '🔼';
            weightsCollapsed = true;
        }
    };
    headerContainer.classList.add('header-container'); 
    headerContainer.appendChild(header);
    headerContainer.appendChild(collapseExpandButton);
    container.appendChild(headerContainer);
}

function createWeightItem(weight) {
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item');

    const itemName = document.createElement('span');
    itemName.textContent = `${weight.name} ${weight.weight}kg`;
    itemName.classList.add('item-name');

    const itemQuantity = document.createElement('span');
    const usedInThisExercise = selectedExercise && workouts[selectedWorkout].exercises[selectedExercise].weights[weight.id] ? workouts[selectedWorkout].exercises[selectedExercise].weights[weight.id].quantity : 0;
    const remainingAfterThisExercise = weight.available - (weight.used - usedInThisExercise);
    itemQuantity.textContent = selectedExercise ? `(${usedInThisExercise}/${remainingAfterThisExercise})` : `(${weight.used}/${weight.available})`;
    itemQuantity.classList.add('item-quantity');

    itemContainer.appendChild(itemName);
    itemContainer.appendChild(itemQuantity);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('item-adjust-button-container');
    const addButton = document.createElement('button');
    addButton.classList.add('item-adjust-button');
    addButton.classList.add('button');
    addButton.textContent = '➕';
    addButton.onclick = () => adjustWeight(weight.id, 1);
    buttonContainer.appendChild(addButton);

    const removeButton = document.createElement('button');
    removeButton.classList.add('item-adjust-button');
    removeButton.classList.add('button');
    removeButton.textContent = "➖";
    removeButton.onclick = () => adjustWeight(weight.id, -1);
    buttonContainer.appendChild(removeButton);
    itemContainer.appendChild(buttonContainer);
    return itemContainer;
}

function toggleWeightAdjust() {
    const weights = document.querySelectorAll('.item-adjust-button');
    weights.forEach(weight => weight.disabled = weightAdjustDisabled);
}

//add a dropdown to select exercise whose weights to reuse
function addReuseWeightsSelection(container) {

    //if already exists remove it
    const existingReuseWeightsSelection = document.querySelector('.reuse-weights-selection');
    if (existingReuseWeightsSelection) {
        existingReuseWeightsSelection.remove();
    }

    const reuseWeightsSelection = document.createElement('select');
    reuseWeightsSelection.classList.add('reuse-weights-selection');
    //add "reuses" property to exercise object value is the exercise whose weights to reuse
    reuseWeightsSelection.onchange = (e) => {
        workouts[selectedWorkout].exercises[selectedExercise].reuses = e.target.value;
        localStorage.setItem('workouts', JSON.stringify(workouts));
        weightAdjustDisabled = (e.target.value != 'none');
        currentReuse = e.target.value;
        if (e.target.value != 'none') {
            workouts[selectedWorkout].exercises[selectedExercise].weights = {};
            localStorage.setItem('workouts', JSON.stringify(workouts));
        }
        displayWeights();
    };
    const option = document.createElement('option');
    option.value = 'none';
    option.textContent = 'None';
    reuseWeightsSelection.appendChild(option);
    for (let exercise in workoutExercises) {
        if (exercise !== selectedExercise) {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = workoutExercises[exercise].name;
            reuseWeightsSelection.appendChild(option);
        }
        reuseWeightsSelection.appendChild(option);
    }
    //set value to the exercise whose weights are being reused
    reuseWeightsSelection.value = workouts[selectedWorkout].exercises[selectedExercise].reuses || 'none';
    container.appendChild(reuseWeightsSelection);
}

function displayWeights() {
    reload();
    weightAdjustDisabled = (selectedExercise === '' || currentReuse !== 'none');
    const weightsContainer = document.getElementById('weightsContainer');
    weightsContainer.innerHTML = '';
    const weightsList = document.createElement('div');
    weightsList.classList.add('weights-list');
    addCollapseHeader(weightsContainer, weightsList, 'Weights');
    const weights = getRemainingAvailableWeights();
    weights.forEach(weight => { weightsList.appendChild(createWeightItem(weight, weights)); });
    weightsContainer.appendChild(weightsList);
    toggleWeightAdjust();
    if(selectedExercise != '') addReuseWeightsSelection(weightsContainer);
    addTotalWeightForExercise(weightsContainer);
}

function addTotalWeightForExercise(container) {
    const totalWeightContainer = document.createElement('div');
    totalWeightContainer.classList.add('total-weight-container');
    const totalWeight = document.createElement('span');
    totalWeight.classList.add('total-weight');
    totalWeight.textContent = selectedExercise ? `${calculateTotalWeight(workouts[selectedWorkout].exercises[selectedExercise].weights)}kg (${convertKgToLbs(calculateTotalWeight(workouts[selectedWorkout].exercises[selectedExercise].weights))}lbs)` : '';
    totalWeightContainer.appendChild(totalWeight);
    container.appendChild(totalWeightContainer);
}

function adjustWeight(weightId, adjustment) {
    const workouts = JSON.parse(localStorage.getItem('workouts'));
    const availableWeights = JSON.parse(localStorage.getItem('availableWeights'));

    let totalUsed = 0;
    Object.values(workouts[selectedWorkout].exercises).forEach(exercise => {
        if (exercise.weights[weightId]) {
            totalUsed += exercise.weights[weightId].quantity;
        }
    });
    const totalAvailable = availableWeights[weightId].quantity;
    const remainingAvailable = totalAvailable - totalUsed;
    let exerciseWeights = workouts[selectedWorkout].exercises[selectedExercise].weights;

    if (exerciseWeights[weightId]) {
        let newQuantity = exerciseWeights[weightId].quantity + adjustment;
        if (newQuantity <= 0) {
            delete exerciseWeights[weightId];
        } else if (adjustment > 0 && (totalUsed + adjustment) <= totalAvailable) {
            exerciseWeights[weightId].quantity = newQuantity;
        } else if (adjustment < 0) {
            exerciseWeights[weightId].quantity = newQuantity;
        }
    } else if (adjustment > 0 && remainingAvailable >= adjustment) {
        exerciseWeights[weightId] = {
            name: availableWeights[weightId].name,
            weight: availableWeights[weightId].weight,
            quantity: adjustment
        };
    }
    localStorage.setItem('workouts', JSON.stringify(workouts));
    displayWeights();
}
function selectExercise(exercise) {
    const exerciseElement = document.getElementById(exercise + "_exercise");
    const exerciseElements = document.getElementsByClassName('exercise');

    if (selectedExercise === exercise) {
        selectedExercise = '';
        currentReuse = '';
        exerciseElement.classList.remove('selected');
    } else {
        selectedExercise = exercise;
        exerciseElement.classList.add('selected');
        currentReuse = workouts[selectedWorkout].exercises[selectedExercise].reuses || 'none';
    }

    for (let ex of exerciseElements) {
        if (ex !== exerciseElement) {
            ex.classList.remove('selected');
        }
    }
    displayWeights();
}
function addExercise() {
    let exerciseName = prompt('Enter Exercise Name');
    if(exerciseName === null) return;
    let exerciseId = exerciseName.toLowerCase().replace(/ /g, '');
    let newExercise = {
        name: exerciseName,
        muscleGroups: '',
        weights: {}
    };
    workouts[selectedWorkout].exercises[exerciseId] = newExercise;
    localStorage.setItem('workouts', JSON.stringify(workouts));
    workouts = JSON.parse(localStorage.getItem('workouts'));
    selectWorkout(selectedWorkout);
}
function deleteExercise(exerciseId, exercise) {
    if (confirm('Are you sure you want to delete ' + exercise.name + '?')) {
        delete workoutExercises[exerciseId];
        localStorage.setItem('workouts', JSON.stringify(workouts));
        workouts = JSON.parse(localStorage.getItem('workouts'));
        displayWorkout();
    } else {
        return;
    }
}
function addWorkout() {
    let workoutName = prompt('Enter the name of the workout');
    if(workoutName === null) return;
    let newWorkout = {
        name: workoutName,
        exercises: {}
    };
    workouts[workoutName] = newWorkout;
    localStorage.setItem('workouts', JSON.stringify(workouts));
    workouts = JSON.parse(localStorage.getItem('workouts'));
    reload();
}
function deleteWorkout() {
    if (confirm('Are you sure you want to delete ' + workouts[selectedWorkout].name + '?')) {
        delete workouts[selectedWorkout];
        localStorage.setItem('workouts', JSON.stringify(workouts));
        workouts = JSON.parse(localStorage.getItem('workouts'));
        selectedWorkout = '';
        reload();
        displayWorkout();
    } else {
        return;
    }
}
function addRecord() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    let workout = workouts[selectedWorkout];
    let workoutName = workout.name;
    let exerciseRecords = {};
    for (let exercise in workout.exercises) {
        let exerciseName = workout.exercises[exercise].name;
        let exerciseWeight;
        if (workout.exercises[exercise].reuses) {
            exerciseWeight = calculateTotalWeight(workout.exercises[workout.exercises[exercise].reuses].weights);
        } else {
            exerciseWeight = calculateTotalWeight(workout.exercises[exercise].weights);
        }
        exerciseRecords[exerciseName] = {
            weights: workout.exercises[exercise].weights,
            totalWeight: exerciseWeight,
            reps: prompt('How many reps did you manage for ' + exerciseName + '? (default 8)') || 8,
        };
    }
    let recordEntry = {
        name: workoutName,
        date: new Date().toLocaleDateString('de-DE'),
        exerciseRecords: exerciseRecords,
        notes: prompt('Add any notes about the workout') || ''
    };
    records.push(recordEntry);
    localStorage.setItem('records', JSON.stringify(records));
    displayRecords();
}

function displayRecord(record, recordsContainer) {
    let recordContainer = document.createElement('div');
    recordContainer.classList.add('record');
    let recordHeader = document.createElement('div');
    recordHeader.classList.add('record-header');
    let recordTitle = document.createElement('span');
    recordTitle.classList.add('record-title');
    recordTitle.textContent = record.date;
    let recordNotes = document.createElement('span');
    recordNotes.classList.add('record-notes');
    recordNotes.textContent = record.notes;
    recordHeader.appendChild(recordTitle);
    recordHeader.appendChild(recordNotes);
    recordContainer.appendChild(recordHeader);
    for (let exercise in record.exerciseRecords) {
        let exerciseContainer = document.createElement('div');
        exerciseContainer.classList.add('exercise-record');
        let exerciseName = document.createElement('span');
        exerciseName.classList.add('exercise-name-record');
        exerciseName.textContent = exercise;
        let exerciseWeight = document.createElement('span');
        exerciseWeight.classList.add('exercise-weight-record');
        exerciseWeight.textContent = record.exerciseRecords[exercise].totalWeight + 'kg';
        let exerciseReps = document.createElement('span');
        exerciseReps.classList.add('exercise-reps-record');
        exerciseReps.textContent = record.exerciseRecords[exercise].reps + 'reps';
        exerciseContainer.appendChild(exerciseName);
        exerciseContainer.appendChild(exerciseWeight);
        exerciseContainer.appendChild(exerciseReps);
        recordContainer.appendChild(exerciseContainer);
    }
    recordsContainer.appendChild(recordContainer);
}

function displayRecords() {
    const recordsContainer = document.getElementById('records');
    recordsContainer.innerHTML = '';
    const recordsHeader = document.createElement('div');
    recordsHeader.classList.add('records-header');
    recordsHeader.appendChild(createAddRecordButton());
    recordsContainer.appendChild(recordsHeader);
    recordsList = document.createElement('div');
    recordsList.classList.add('records-list');
    addCollapseHeader(recordsContainer, recordsList, 'Records');
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records = records.filter(record => record.name === workouts[selectedWorkout].name);
    //reverse the records so the most recent is at the top
    records.reverse();
    if (records.length > 0) {
        records.forEach(record => {
            displayRecord(record, recordsList);
        });
    } else {
        recordsList.innerHTML = 'No records for this workout';
    } 
    recordsContainer.appendChild(recordsList);
}

function createAddRecordButton() {
    const addRecordButton = document.getElementById('addRecord');
    if (addRecordButton) {
        addRecordButton.remove();
    }
    const button = document.createElement('button');
    button.textContent = 'Add Record';
    button.onclick = function () { addRecord(); };
    button.id = 'addRecord';
    button.classList.add('addButton');
    button.classList.add('button');
    return button;
}

function deleteRecord() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records = records.filter(record => record.name !== workouts[selectedWorkout].name);
    localStorage.setItem('records', JSON.stringify(records));
    displayRecords();
}

