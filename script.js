document.addEventListener('DOMContentLoaded', async () => {
    await logIntoHomeNetwork();
    listWorkouts();
    displayWorkout();
});