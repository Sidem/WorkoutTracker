let weightsCollapsed = true;
let weightAdjustDisabled = true;
let murica = false;

function addMuricaSwitch(container) {
    const muricaButton = document.createElement('img');
    muricaButton.src = './icons/merica.png';
    muricaButton.classList.add('murica-button');
    muricaButton.onclick = () => {
        murica = !murica;
        if (murica) muricaButton.classList.add('muricaa');
        else muricaButton.classList.remove('muricaa');
        displayWeights();
    };
    container.appendChild(muricaButton);
}

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

function createChangeUserButton() {
    const changeUserButton = document.getElementById('changeUser');
    if (changeUserButton) {
        changeUserButton.remove();
    }
    const button = document.createElement('button');
    button.textContent = '👤';
    button.onclick = async function () {
        let username = await customPrompt('Enter your username:', getUsername());
        if (username === null || username == '') return;
        setUsername(username);
        clearData();
        location.reload();
    };
    button.id = 'changeUser';
    button.classList.add('changeUserButton');
    button.classList.add('button');
    document.getElementById('workouts').appendChild(button);
}

function listWorkouts() {
    const workoutsContainer = document.getElementById('workouts');
    workoutsContainer.innerHTML = '';
    Object.keys(workouts).forEach(workout => { createWorkoutButton(workout, workoutsContainer); });
    workoutsContainer.appendChild(createAddButton('addWorkout', () => { addWorkout(); }));
}

function displayWorkout() {
    if (selectedWorkout != '') {
        document.getElementById('workoutTitle').innerText = workouts[selectedWorkout].name;
        displayExerciseButtons();
        displayDeleteButton('workout_delete', document.getElementById('workout'), () => { deleteWorkout(); });
        displayWeights();
        displayRecords();
        document.getElementById('workout').style.display = 'block';
    } else {
        clearCurrentWorkout();
    }
    createChangeUserButton();
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
    exercisesList.appendChild(createAddButton('addExercise', () => { addExercise(); }));
}

function clearCurrentWorkout() {
    document.getElementById('workoutTitle').innerText = 'Select a workout';
    document.getElementById('exercises').innerText = '';
}

function convertKgToLbs(kg) {
    return (kg * 2.20462).toFixed(1);
}

function addCollapseHeader(container, collapseTarget, title) {
    const collapseExpandButton = document.createElement('span');
    collapseExpandButton.classList.add('collapse-expand-button');
    collapseExpandButton.textContent = weightsCollapsed ? '🔼' : '🔽';
    if (weightsCollapsed) collapseTarget.classList.add('collapsed');
    else collapseTarget.classList.remove('collapsed');
    const header = document.createElement('span');
    header.classList.add('header');
    header.textContent = title;
    const headerContainer = document.createElement('div');
    headerContainer.onclick = function () {
        if (weightsCollapsed) {
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
    return headerContainer;
}

function createWeightItem(weight) {
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item');
    const weightIcon = document.createElement('img');
    weightIcon.src = `./icons/${weight.name.toLowerCase()}.png`;
    weightIcon.classList.add('item-icon');
    itemContainer.appendChild(weightIcon);

    const itemName = document.createElement('span');
    itemName.textContent = murica ? `${convertKgToLbs(weight.weight)}lbs` : `${weight.weight.toFixed(2)}kg`;
    itemName.classList.add('item-name');

    const itemQuantity = document.createElement('div');
    const usedInThisExercise = selectedExercise && workouts[selectedWorkout].exercises[selectedExercise].weights[weight.id] ? workouts[selectedWorkout].exercises[selectedExercise].weights[weight.id].quantity : 0;
    const remainingAfterThisExercise = weight.available - (weight.used - usedInThisExercise);
    const usedItems = selectedExercise ? usedInThisExercise : weight.used;
    const availableItems = selectedExercise ? remainingAfterThisExercise : weight.available;
    for (let i = 0; i < availableItems; i++) {
        const itemBar = document.createElement('div');
        itemBar.classList.add('item-quantity-bar');
        if (i < usedItems) itemBar.classList.add('item-quantity-bar-filled');
        itemBar.style.width = `${100 / availableItems}%`;
        itemQuantity.appendChild(itemBar);
    }
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

function addReuseWeightsSelection(container) {
    const existingReuseWeightsSelection = document.querySelector('.reuse-weights-selection');
    if (existingReuseWeightsSelection) {
        existingReuseWeightsSelection.remove();
    }

    const reuseWeightsSelection = document.createElement('select');
    reuseWeightsSelection.classList.add('reuse-weights-selection');
    const reuseWeightsLabel = document.createElement('label');
    reuseWeightsLabel.textContent = 'Reuse:';
    reuseWeightsLabel.classList.add('reuse-weights-label');
    container.appendChild(reuseWeightsLabel);

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
    if (selectedExercise != '') addReuseWeightsSelection(weightsContainer);
    let totalWeightContainer = addTotalWeightForExercise(weightsContainer);
    addMuricaSwitch(totalWeightContainer);
}

function addTotalWeightForExercise(container) {
    const totalWeightContainer = document.createElement('div');
    totalWeightContainer.classList.add('total-weight-container');
    const totalWeight = document.createElement('span');
    totalWeight.classList.add('total-weight');
    if (currentReuse !== 'none') {
        totalWeight.textContent = `${calculateTotalWeight(workouts[selectedWorkout].exercises[currentReuse].weights)}kg (${convertKgToLbs(calculateTotalWeight(workouts[selectedWorkout].exercises[currentReuse].weights))}lbs)`;
    } else {
        totalWeight.textContent = selectedExercise ? `${calculateTotalWeight(workouts[selectedWorkout].exercises[selectedExercise].weights)}kg (${convertKgToLbs(calculateTotalWeight(workouts[selectedWorkout].exercises[selectedExercise].weights))}lbs)` : '';
    }
    if (selectedExercise == '') totalWeight.textContent = 'Select exercise to see weight.';
    totalWeightContainer.appendChild(totalWeight);
    container.appendChild(totalWeightContainer);
    return totalWeightContainer;
}

function customPrompt(message, defaultValue = '', inputType = 'text') {
    return new Promise((resolve) => {
        let inputId = 'customTextInput';
        let isConfirm = false;
        switch (inputType) {
            case 'number':
                inputId = 'customNumberInput';
                break;
            case 'confirm':
                isConfirm = true;
                break;
            default:
                inputType = 'text';
        }
        const promptModal = document.createElement('div');
        promptModal.innerHTML = `
            <div class="promptModal">
                <form id="customPromptForm">
                    <label for="${inputId}">${message}</label>
                    ${isConfirm ? `
                        <button type="button" id="confirmBtn" class="button modalButton">YES</button>
                        <button type="button" id="cancelBtn" class="button modalButton">NO</button>
                    ` : `
                        <input type="${inputType}" id="${inputId}" class="customInput" placeholder="${defaultValue}" />
                        <button type="submit" id="confirmBtn" class="button modalButton">OK</button>
                        <button type="button" id="cancelBtn" class="button modalButton">Cancel</button>
                    `}
                </form>
            </div>
        `;
        document.body.appendChild(promptModal);

        if (isConfirm) {
            document.getElementById('confirmBtn').addEventListener('click', function () {
                resolve(true);
                document.body.removeChild(promptModal);
            });
            document.getElementById('cancelBtn').addEventListener('click', function () {
                resolve(false);
                document.body.removeChild(promptModal);
            });
        } else {
            const form = document.getElementById('customPromptForm');
            const numberInput = document.getElementById(inputId);
            numberInput.focus();
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                resolve(numberInput.value || defaultValue);
                document.body.removeChild(promptModal);
            });
            document.getElementById('cancelBtn').addEventListener('click', function () {
                resolve(null);
                document.body.removeChild(promptModal);
            });
        }
    });
}

function getWeek(date) {
    let firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    let pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function displayRecord(recordID, record, recordsContainer) {
    let recordContainer = document.createElement('div');
    recordContainer.classList.add('record');
    let recordHeader = document.createElement('div');
    recordHeader.classList.add('record-header');
    let recordTitle = document.createElement('span');
    recordTitle.classList.add('record-title');
    recordTitle.textContent = new Date(record.date).toLocaleDateString("en-GB");
    let recordNotes = document.createElement('span');
    recordNotes.classList.add('record-notes');
    recordNotes.textContent = record.notes;

    recordHeader.appendChild(recordTitle);
    recordHeader.appendChild(recordNotes);
    displayDeleteButton('record_delete_' + recordID, recordContainer, () => { deleteRecord(recordID); });

    recordContainer.appendChild(recordHeader);
    for (let exercise in record.exerciseRecords) {
        let exerciseContainer = document.createElement('div');
        exerciseContainer.classList.add('exercise-record');
        let exerciseName = document.createElement('span');
        exerciseName.classList.add('exercise-name-record');
        exerciseName.textContent = exercise;
        let exerciseWeight = document.createElement('span');
        exerciseWeight.classList.add('exercise-weight-record');
        let totalWeight = record.exerciseRecords[exercise].totalWeight;
        exerciseWeight.textContent = totalWeight + 'kg|' + convertKgToLbs(totalWeight) + 'lbs';
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

    records = records[selectedWorkout];

    if (records && records.length > 0) {
        records.forEach(record => {
            let recordID = records.indexOf(record);
            displayRecord(recordID, record, recordsList);
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