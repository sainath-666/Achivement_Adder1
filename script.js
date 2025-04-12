let currentUser = null; // Track the logged-in user
let users = JSON.parse(localStorage.getItem("users")) || []; // Store registered users

// Check if user is already logged in
function checkLoggedInUser() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("achievement-section").style.display = "block";
        loadAchievements();
    }
}

// Run on page load
checkLoggedInUser();

// Toggle between login and register forms with animation
document.getElementById("show-register-form").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

document.getElementById("show-login-form").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
});

// Form validation function
function validateForm(username, password) {
    if (!username || username.trim() === "") {
        return { valid: false, message: "Username cannot be empty" };
    }
    if (!password || password.length < 4) {
        return { valid: false, message: "Password must be at least 4 characters long" };
    }
    return { valid: true };
}

// User login functionality with validation
document.getElementById("login-button").addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const validation = validateForm(username, password);
    
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    // Check if user exists
    const userExists = users.find(user => user.username === username && user.password === password);
    
    if (userExists || (users.length === 0 && username && password)) {
        currentUser = username;
        localStorage.setItem("currentUser", username);
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("achievement-section").style.display = "block";
        loadAchievements();
    } else {
        alert("Invalid username or password. Please try again.");
    }
});

// User registration with validation
document.getElementById("register-button").addEventListener("click", function () {
    const newUsername = document.getElementById("new-username").value;
    const newPassword = document.getElementById("new-password").value;

    const validation = validateForm(newUsername, newPassword);
    
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    // Check if username already exists
    const userExists = users.some(user => user.username === newUsername);
    
    if (userExists) {
        alert("Username already exists. Please choose another one.");
        return;
    }
    
    // Add new user
    users.push({ username: newUsername, password: newPassword });
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("Registration successful! You can now log in.");
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    
    // Auto-fill login form
    document.getElementById("username").value = newUsername;
    document.getElementById("password").value = newPassword;
});

// Logout functionality
document.getElementById("logout-button").addEventListener("click", function () {
    currentUser = null;
    localStorage.removeItem("currentUser");
    document.getElementById("achievement-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
    
    // Clear form fields
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("new-username").value = "";
    document.getElementById("new-password").value = "";
});

// Handle Achievement Form Submission
// Handle Achievement Form Submission with improved file handling
document.getElementById("add-achievement").addEventListener("click", function () {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("file").files[0];

    if (!title || title.trim() === "") {
        alert("Please enter a title for your achievement");
        return;
    }
    
    if (!description || description.trim() === "") {
        alert("Please enter a description for your achievement");
        return;
    }

    // Create a timestamp for the achievement
    const timestamp = new Date().toLocaleString();

    // Process file if provided
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const achievement = {
                id: Date.now(), // Unique ID for the achievement
                title,
                description,
                addedBy: currentUser,
                timestamp,
                file: event.target.result // Store as base64 string
            };

            saveAchievement(achievement);
        };
        reader.readAsDataURL(file);
    } else {
        const achievement = {
            id: Date.now(),
            title,
            description,
            addedBy: currentUser,
            timestamp,
            file: null
        };

        saveAchievement(achievement);
    }
});

// Save achievement to localStorage
function saveAchievement(achievement) {
    let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    achievements.push(achievement);
    localStorage.setItem("achievements", JSON.stringify(achievements));

    // Clear form fields
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("file").value = "";

    // Show success message
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Achievement added successfully!";
    document.querySelector(".achievement-form").appendChild(successMessage);

    // Remove message after 3 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 3000);

    loadAchievements(); // Reload the achievements after adding
}

// Load achievements from local storage with improved display
function loadAchievements() {
    const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const achievementList = document.getElementById("achievement-list");
    achievementList.innerHTML = "";

    if (achievements.length === 0) {
        achievementList.innerHTML = `
            <div class="no-achievements">
                <p>You haven't added any achievements yet. Use the form to add your first achievement!</p>
            </div>
        `;
        return;
    }

    // Sort achievements by newest first
    achievements.sort((a, b) => (b.id || 0) - (a.id || 0));

    achievements.forEach((achievement, index) => {
        const card = document.createElement("div");
        card.classList.add("achievement-card");

        // Only show edit/delete buttons for achievements added by current user
        const actionButtons = achievement.addedBy === currentUser ? `
            <div class="action-buttons">
                <button class="edit-btn" onclick="editAchievement(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteAchievement(${index})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        ` : '';

        const imageElement = achievement.file ? `<img src="${achievement.file}" alt="${achievement.title}" loading="lazy">` : "";
        const timestamp = achievement.timestamp ? `<p class="timestamp"><i class="far fa-clock"></i> ${achievement.timestamp}</p>` : "";
        
        card.innerHTML = `
            ${imageElement}
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <p class="added-by"><i class="fas fa-user"></i> Added by: ${achievement.addedBy}</p>
            ${timestamp}
            ${actionButtons}
        `;
        achievementList.appendChild(card);
    });
}

// Delete achievement functionality with confirmation
function deleteAchievement(index) {
    if (confirm("Are you sure you want to delete this achievement?")) {
        let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
        achievements.splice(index, 1); // Remove achievement from array
        localStorage.setItem("achievements", JSON.stringify(achievements)); // Save updated list
        loadAchievements(); // Reload achievements after deletion
    }
}

// Edit achievement functionality with improved UX
function editAchievement(index) {
    let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const achievement = achievements[index];
    let isEditing = true;

    // Scroll to form
    document.querySelector(".achievement-form").scrollIntoView({ behavior: 'smooth' });

    // Update form with achievement data
    document.getElementById("title").value = achievement.title;
    document.getElementById("description").value = achievement.description;
    
    // Change button text to indicate editing mode
    const addButton = document.getElementById("add-achievement");
    const originalButtonText = addButton.innerHTML;
    addButton.innerHTML = `<i class="fas fa-save"></i> Update Achievement`;
    
    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.className = "submit-btn cancel-btn";
    cancelButton.innerHTML = `<i class="fas fa-times"></i> Cancel`;
    addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
    
    // Handle cancel button click
    cancelButton.addEventListener("click", function() {
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("file").value = "";
        addButton.innerHTML = originalButtonText;
        cancelButton.remove();
        isEditing = false;
    });
    
    // Override add button functionality temporarily
    const originalClickHandler = addButton.onclick;
    addButton.onclick = function() {
        if (!isEditing) return;
        
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const file = document.getElementById("file").files[0];
        
        if (!title || !description) {
            alert("Please fill in all required fields");
            return;
        }
        
        // Update achievement
        achievement.title = title;
        achievement.description = description;
        
        // Process file if a new one is provided
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                achievement.file = event.target.result;
                finishUpdate();
            };
            reader.readAsDataURL(file);
        } else {
            finishUpdate();
        }
        
        function finishUpdate() {
            // Save updated achievements
            localStorage.setItem("achievements", JSON.stringify(achievements));
            
            // Reset form
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("file").value = "";
            addButton.innerHTML = originalButtonText;
            addButton.onclick = originalClickHandler;
            cancelButton.remove();
            
            // Show success message
            const successMessage = document.createElement("div");
            successMessage.className = "success-message";
            successMessage.textContent = "Achievement updated successfully!";
            document.querySelector(".achievement-form").appendChild(successMessage);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
            loadAchievements();
            isEditing = false;
        }
    };
}

// Add event listeners for responsive design
window.addEventListener('resize', function() {
    adjustLayout();
});

function adjustLayout() {
    const width = window.innerWidth;
    const achievementSection = document.getElementById('achievement-section');
    
    if (width <= 768) {
        // Mobile layout adjustments
        if (achievementSection.style.display !== 'none') {
            document.querySelector('.achievement-form').style.marginTop = '20px';
        }
    } else {
        // Desktop layout adjustments
        if (achievementSection.style.display !== 'none') {
            document.querySelector('.achievement-form').style.marginTop = '30px';
        }
    }
}

// Initialize layout
adjustLayout();
