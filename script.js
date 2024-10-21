//require('dotenv').config();

let progressValues = {}; // Object to store the progress points for each habit

let userId = ''; // Specify the user ID
const backEndUrl = 'https://habitheroserver-production.up.railway.app';
const apiKey = 'elvetia_tara_faina'; // Replace with your actual API key
//const apiKey = process.env.API_KEY; // Access the API key from the environment variable

document.addEventListener('DOMContentLoaded', function () {

     // Check if userId exists in sessionStorage
        userId = sessionStorage.getItem('userId');
        
        if (!userId) {
            // If no userId, redirect to login page
            window.location.href = 'login.html';
        } else {
            // Proceed with loading the page content
            console.log('User is logged in with ID:', userId);
            // You can use the userId for making API requests or loading user-specific data
        }


    // Fetch habit data from the API for the specified user
    fetch(`${backEndUrl}/users/${userId}`, {
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const habits = data.habits;
            const habitContainer = document.getElementById('habitContainer');

            // Clear the habit container (in case it's not empty)
            habitContainer.innerHTML = '';

            // Aesthetic classes for progress bars
            const aestheticClasses = ['flame-bar', 'wave-bar', 'lightning-bar', 'star-bar'];

            // Iterate through each habit and create the necessary HTML elements
            habits.forEach((habit, index) => {
                // Initialize progressValues
                progressValues[habit.id] = habit.points;

                // Create a new habit element
                const habitElement = document.createElement('div');
                habitElement.className = 'habit';

                // Create habit title
                const habitTitle = document.createElement('h3');
                habitTitle.textContent = habit.name;
                habitElement.appendChild(habitTitle);

                // Create the progress section
                const progressSection = document.createElement('div');
                progressSection.className = 'progress-section';

                // Create the button
                const button = document.createElement('button');
                button.textContent = '+1';
                button.disabled = !habit.has24HoursPassed;  // Disable button if 24 hours haven't passed

                // Add an onclick event to the button
                button.onclick = function () {
                    if (!button.disabled) {
                        updateProgress(habit.id, button);
                    }
                };
                progressSection.appendChild(button);

                // Create the progress bar
                const progressBar = document.createElement('div');
                progressBar.className = `progress-bar ${aestheticClasses[index % aestheticClasses.length]}`; // Assign aesthetic class

                // Create the progress element
                const progress = document.createElement('div');
                progress.className = 'progress';
                progress.id = `progress-${habit.id}`;
                progress.style.width = `${habit.points}%`;  // Set initial width based on points

                progressBar.appendChild(progress);
                progressSection.appendChild(progressBar);

                // Add the progress section to the habit element
                habitElement.appendChild(progressSection);

                // Add the habit element to the habit container
                habitContainer.appendChild(habitElement);
            });

            // Update character initially based on loaded data
            updateCharacter();
        })
        .catch(error => console.error('Error fetching habit data:', error));
});

function updateProgress(habitId, button) {

    // Increment habit points on the server
    fetch(`${backEndUrl}/users/${userId}/habits/${habitId}/increment`, {
        method: 'PATCH',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to increment habit points');
        }
        return response.json();
    })
    .then(updatedHabit => {
        const progressElement = document.getElementById(`progress-${habitId}`);
        const newWidth = updatedHabit.points;

        // Update the progress bar width
        progressElement.style.width = `${newWidth}%`;

        // Update progressValues
        progressValues[habitId] = newWidth;

        // Disable the button after updating
        button.disabled = true;

        // Update character image
        updateCharacter();
    })
    .catch(error => console.error('Error updating habit progress:', error));
}

function updateCharacter() {
    // Calculate total points from progressValues
    const totalPoints = Object.values(progressValues).reduce((a, b) => a + b, 0);
    const characterImage = document.getElementById("characterImage");

    console.log(totalPoints);

    // Update character image based on total points
    if (totalPoints >= 40) {
        characterImage.src = "character5.png";
    } else if (totalPoints >= 30) {
        characterImage.src = "character4.png";
    } else if (totalPoints >= 20) {
        characterImage.src = "character3.png";
    } else if (totalPoints >= 10) {
        characterImage.src = "character2.png";
    } else {
        characterImage.src = "character1.png";
    }
}
