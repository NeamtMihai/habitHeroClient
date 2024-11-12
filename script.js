let progressValues = {}; // Object to store the progress points for each habit

let userId = ''; // Specify the user ID
const backEndUrl = 'https://habitheroserver-production.up.railway.app';
const apiKey = 'elvetia_tara_faina'; // Replace with your actual API key



document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      location.reload();
    }
  });
  
document.addEventListener('DOMContentLoaded', function () {
    const refreshInterval = 5000; // 5000 ms = 5 seconds

    // setInterval(() => {
    //     location.reload();
    // }, refreshInterval);

    userId = sessionStorage.getItem('userId');

    if (!userId) {
        window.location.href = 'login.html';
    } else {
        console.log('User is logged in with ID:', userId);
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
            const characterNameDiv = document.getElementById("characterName");
            characterNameDiv.innerText = `Hello ${data.name}`;

            const habits = data.habits;
            const habitContainer = document.getElementById('habitContainer');
            habitContainer.innerHTML = '';

            const aestheticClasses = ['flame-bar', 'wave-bar', 'lightning-bar', 'star-bar'];

            habits.forEach((habit, index) => {
                progressValues[habit.id] = habit.points;

                const habitElement = document.createElement('div');
                habitElement.className = 'habit';

                // Habit title and edit button
                const habitTitleContainer = document.createElement('div');
                habitTitleContainer.className = 'habit-title-container';

                const habitTitle = document.createElement('h3');
                habitTitle.textContent = habit.name + " " + habit.points + "/100";

                const editButton = document.createElement('button');
                editButton.textContent = '✏️';
                editButton.className = 'edit-button';

                // Edit functionality
                editButton.onclick = function () {
                    const newName = prompt("Enter the new name for the habit:", habit.name);
                    if (newName) {
                        updateHabitName(habit.id, newName, habitTitle);
                    }
                };

                habitTitleContainer.appendChild(habitTitle);
                habitTitleContainer.appendChild(editButton);

                habitElement.appendChild(habitTitleContainer);

                // Progress section
                const progressSection = document.createElement('div');
                progressSection.className = 'progress-section';

                const button = document.createElement('button');
                button.textContent = '+1';
                button.disabled = !habit.has24HoursPassed;

                button.onclick = function () {
                    if (!button.disabled) {
                        updateProgress(habit.id, button);
                    }
                };

                const progressBar = document.createElement('div');
                progressBar.className = `progress-bar ${aestheticClasses[index % aestheticClasses.length]}`;

                const progress = document.createElement('div');
                progress.className = 'progress';
                progress.id = `progress-${habit.id}`;
                progress.style.width = `${habit.points * 2}%`;

                progressBar.appendChild(progress);
                progressSection.appendChild(button);
                progressSection.appendChild(progressBar);

                habitElement.appendChild(progressSection);
                habitContainer.appendChild(habitElement);
            });

            updateCharacter();
        })
        .catch(error => console.error('Error fetching habit data:', error));
});

function updateProgress(habitId, button) {
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

            progressElement.style.width = `${newWidth}%`;
            progressValues[habitId] = newWidth;
            button.disabled = true;

            updateCharacter();
        })
        .catch(error => console.error('Error updating habit progress:', error));
}

function updateHabitName(habitId, newName, habitTitleElement) {
    fetch(`${backEndUrl}/users/${userId}/habits/${habitId}/name`, {
        method: 'PATCH',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update habit name');
            }
            return response.json();
        })
        .then(updatedHabit => {
            habitTitleElement.textContent = updatedHabit.name + " " + updatedHabit.points + "/100";
        })
        .catch(error => console.error('Error updating habit name:', error));
}

function updateCharacter() {
    const totalPoints = Object.values(progressValues).reduce((a, b) => a + b, 0);
    const characterImage = document.getElementById("characterImage");

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