let currentUser = null; // Track the logged-in user

// User login functionality
document.getElementById("show-register-form").addEventListener("click", function () {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

document.getElementById("show-login-form").addEventListener("click", function () {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
});

document.getElementById("login-button").addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
        currentUser = username;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("achievement-section").style.display = "block";
        loadAchievements();
    } else {
        alert("Please enter valid details.");
    }
});

document.getElementById("register-button").addEventListener("click", function () {
    const newUsername = document.getElementById("new-username").value;
    const newPassword = document.getElementById("new-password").value;

    if (newUsername && newPassword) {
        alert("Registration successful! You can now log in.");
        document.getElementById("register-form").style.display = "none";
        document.getElementById("login-form").style.display = "block";
    } else {
        alert("Please fill in all fields.");
    }
});

// Logout functionality
document.getElementById("logout-button").addEventListener("click", function () {
    currentUser = null;
    document.getElementById("achievement-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
});

// Handle Achievement Form Submission
document.getElementById("add-achievement").addEventListener("click", function () {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("file").files[0];

    if (title && description) {
        const achievement = {
            title,
            description,
            addedBy: currentUser,
            file: file ? URL.createObjectURL(file) : null
        };

        let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
        achievements.push(achievement);
        localStorage.setItem("achievements", JSON.stringify(achievements));

        loadAchievements(); // Reload the achievements after adding
    } else {
        alert("Please fill in all fields.");
    }
});

// Load achievements from local storage
function loadAchievements() {
    const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const achievementList = document.getElementById("achievement-list");
    achievementList.innerHTML = "";

    achievements.forEach((achievement, index) => {
        const card = document.createElement("div");
        card.classList.add("achievement-card");

        const imageElement = achievement.file ? `<img src="${achievement.file}" alt="Achievement Image">` : "";
        card.innerHTML = `
            ${imageElement}
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <p class="added-by">Added by: ${achievement.addedBy}</p>
            <button class="edit-btn" onclick="editAchievement(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteAchievement(${index})">Delete</button>
        `;
        achievementList.appendChild(card);
    });
}

// Delete achievement functionality
function deleteAchievement(index) {
    let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    achievements.splice(index, 1); // Remove achievement from array
    localStorage.setItem("achievements", JSON.stringify(achievements)); // Save updated list
    loadAchievements(); // Reload achievements after deletion
}

// Edit achievement functionality
function editAchievement(index) {
    let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const achievement = achievements[index];

    document.getElementById("title").value = achievement.title;
    document.getElementById("description").value = achievement.description;
    document.getElementById("file").files = achievement.file ? [new File([], achievement.file)] : [];

    // After editing, update achievement
    achievements.splice(index, 1);
    localStorage.setItem("achievements", JSON.stringify(achievements));
    loadAchievements();
}
