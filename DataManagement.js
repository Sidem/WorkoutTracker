let selectedWorkout = '';
let availableWorkoutWeights = {};
let workoutExercises = {};
let selectedExercise = '';
let currentReuse = 'none';

function selectWorkout(workout) {
    selectedWorkout = workout;
    selectedExercise = '';
    workoutExercises = workouts[workout].exercises;
    getRemainingAvailableWeights();
    displayWorkout();
}

function reload() {
    workouts = getWorkouts();
    availableWeights = getAvailableWeights();
    workoutExercises = selectedWorkout == '' ? {} : workouts[selectedWorkout].exercises;
    listWorkouts();
}

function calculateTotalWeight(weights) {
    let totalUsedWeight = 0;
    for (let weight in weights) {
        totalUsedWeight += weights[weight].weight * weights[weight].quantity;
    }
    return totalUsedWeight;
}

function getRemainingAvailableWeights() {
    let availableWorkoutWeights = getAvailableWeights();
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
    }));
}

function adjustWeight(weightId, adjustment) {
    const workouts = getWorkouts();
    const availableWeights = getAvailableWeights();

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
    setWorkouts(workouts);
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

async function addExercise() {
    let exerciseName = await customPrompt('Enter Exercise Name', '');
    if (exerciseName === null || exerciseName == '') return;
    let exerciseId = exerciseName.toLowerCase().replace(/ /g, '');
    let newExercise = {
        name: exerciseName,
        muscleGroups: '',
        weights: {}
    };
    workouts[selectedWorkout].exercises[exerciseId] = newExercise;
    setWorkouts(workouts);
    workouts = getWorkouts();
    selectWorkout(selectedWorkout);
}

function deleteExercise(exerciseId, exercise) {
    if (confirm('Are you sure you want to delete ' + exercise.name + '?')) {
        delete workoutExercises[exerciseId];
        setWorkouts(workouts);
        workouts = getWorkouts();
        displayWorkout();
    } else {
        return;
    }
}

async function addWorkout() {
    let workoutName = await customPrompt('Enter the name of the workout', '');
    if (workoutName === null || workoutName == '') return;
    let newWorkout = {
        name: workoutName,
        exercises: {}
    };
    workouts[workoutName] = newWorkout;
    setWorkouts(workouts);
    workouts = getWorkouts();
    reload();
}

function deleteWorkout() {
    if (confirm('Are you sure you want to delete ' + workouts[selectedWorkout].name + '?')) {
        delete workouts[selectedWorkout];
        setWorkouts(workouts);
        workouts = getWorkouts();
        selectedWorkout = '';
        reload();
        displayWorkout();
    } else {
        return;
    }
}

async function addWorkoutRecord() {
    let records = getRecords();
    let workout = workouts[selectedWorkout];
    let workoutName = workout.name;
    let exerciseRecords = {};
    for (let exercise in workout.exercises) {
        let exerciseName = workout.exercises[exercise].name;
        let exerciseWeight;
        let reuses = workout.exercises[exercise].reuses;
        if (reuses && reuses != 'none') {
            exerciseWeight = calculateTotalWeight(workout.exercises[workout.exercises[exercise].reuses].weights);
        } else {
            exerciseWeight = calculateTotalWeight(workout.exercises[exercise].weights);
        }
        exerciseRecords[exerciseName] = {
            weights: workout.exercises[exercise].weights,
            totalWeight: exerciseWeight,
            reps: await customPrompt(exerciseName + ' reps?', 8, 'number'),
        };
    }
    let recordEntry = {
        name: workoutName,
        date: new Date(),
        exerciseRecords: exerciseRecords,
        notes: await customPrompt('Add any notes about the workout', '')
    };
    if (!records[workoutName]) {
        records[workoutName] = [];
    }
    records[workoutName].unshift(recordEntry);
    setRecords(records);
    displayRecords();
}

async function addMeasurementRecord() {
    let measurementRecords = getMeasurementRecords();
    let date = new Date();
    let lastEntry = Object.keys(measurementRecords).sort().reverse()[0];
    if (lastEntry) {
        lastEntry = measurementRecords[lastEntry];
    }
    
    let recordEntry = {
        date: date,
        weight: await customPrompt('Enter your weight in kg', lastEntry ? lastEntry.weight : 0, 'number'),
        chest: await customPrompt('Enter your chest measurement', lastEntry ? lastEntry.chest : 0, 'number'),
        waist: await customPrompt('Enter your waist measurement', lastEntry ? lastEntry.waist : 0, 'number'),
        hips: await customPrompt('Enter your hip measurement', lastEntry ? lastEntry.hips : 0, 'number'),
        bicep: await customPrompt('Enter your bicep measurement', lastEntry ? lastEntry.bicep : 0, 'number'),
        thigh: await customPrompt('Enter your thigh measurement', lastEntry ? lastEntry.thigh : 0, 'number'),
    };
    measurementRecords[date] = recordEntry;
    setMeasurementRecords(measurementRecords);
}

async function addRecord() {
    if (await customPrompt('Do you want to enter a new record?', 0, 'confirm')) {
        await addWorkoutRecord();
    }
    if (await customPrompt('Do you want to enter your current weight and measurements?', 0, 'confirm')) {
        await addMeasurementRecord();
    }

}

function deleteRecord(recordID) {
    if (confirm('Are you sure you want to delete this record?')) {
        let records = getRecords();
        let selectedRecords = records[selectedWorkout];
        selectedRecords.splice(recordID, 1);
        records[selectedWorkout] = selectedRecords;
        setRecords(records);
        displayRecords();
    } else {
        return;
    }
}

