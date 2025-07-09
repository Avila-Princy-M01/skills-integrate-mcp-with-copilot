document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
 copilot/fix-9
  const highlightsContent = document.getElementById("highlights-content");

  // Function to fetch and display participation highlights
  async function fetchParticipationHighlights() {
    try {
      const response = await fetch("/participation-highlights");
      const data = await response.json();

      // Clear loading message
      highlightsContent.innerHTML = "";

      // Create highlights content
      const highlightsHTML = `
        <div class="highlights-stats">
          <div class="stat-item">
            <span class="stat-number">${data.total_participants}</span>
            <span class="stat-label">Active Students</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.total_activities}</span>
            <span class="stat-label">Available Activities</span>
          </div>
        </div>
        <div class="top-participants">
          <h4>🏆 Most Active Participants</h4>
          ${data.top_participants.length > 0 
            ? `<ul class="participants-highlight-list">
                ${data.top_participants.map(participant => `
                  <li class="participant-highlight">
                    <span class="participant-name">${participant.email}</span>
                    <span class="activity-count">${participant.total_activities} activities</span>
                    <div class="activity-badges">
                      ${participant.activities.map(activity => `
                        <span class="activity-badge">${activity}</span>
                      `).join('')}
                    </div>
                  </li>
                `).join('')}
              </ul>`
            : '<p class="no-participants">No participants yet</p>'
          }
        </div>
      `;

      highlightsContent.innerHTML = highlightsHTML;
    } catch (error) {
      highlightsContent.innerHTML = 
        "<p>Failed to load participation highlights. Please try again later.</p>";
      console.error("Error fetching participation highlights:", error);
    }

  
  // Authentication elements
  const userIcon = document.getElementById("user-icon");
  const userInfo = document.getElementById("user-info");
  const userName = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");
  const closeModal = document.getElementById("close-modal");
  const signupContainer = document.getElementById("signup-container");
  const teacherOnlyNote = document.getElementById("teacher-only-note");
  
  // Authentication state
  let isAuthenticated = false;
  let authToken = localStorage.getItem("authToken");
  
  // Initialize authentication status
  checkAuthStatus();

  // Authentication functions
  async function checkAuthStatus() {
    if (authToken) {
      try {
        const response = await fetch("/auth/status", {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            isAuthenticated = true;
            userName.textContent = `Welcome, ${data.name}`;
            updateUIForAuth(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    }
    
    // Not authenticated
    isAuthenticated = false;
    authToken = null;
    localStorage.removeItem("authToken");
    updateUIForAuth(false);
  }
  
  function updateUIForAuth(authenticated) {
    if (authenticated) {
      userIcon.classList.add("hidden");
      userInfo.classList.remove("hidden");
      signupForm.classList.remove("hidden");
      teacherOnlyNote.classList.add("hidden");
    } else {
      userIcon.classList.remove("hidden");
      userInfo.classList.add("hidden");
      signupForm.classList.add("hidden");
      teacherOnlyNote.classList.remove("hidden");
    }
    
    // Update delete buttons visibility
    updateDeleteButtons();
  }
  
  function updateDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
      if (isAuthenticated) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
      }
    });
  }
  
  // Login modal functions
  function showLoginModal() {
    loginModal.classList.remove("hidden");
    document.getElementById("username").focus();
  }
  
  function hideLoginModal() {
    loginModal.classList.add("hidden");
    loginForm.reset();
    loginMessage.classList.add("hidden");
  }
  
  async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        authToken = result.token;
        localStorage.setItem("authToken", authToken);
        isAuthenticated = true;
        userName.textContent = `Welcome, ${result.name}`;
        updateUIForAuth(true);
        hideLoginModal();
        
        // Show success message
        messageDiv.textContent = "Login successful!";
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 3000);
      } else {
        console.error("Login failed:", result);
        loginMessage.textContent = result.detail || "Login failed";
        loginMessage.className = "error";
        loginMessage.classList.remove("hidden");
      }
    } catch (error) {
      loginMessage.textContent = "Login failed. Please try again.";
      loginMessage.className = "error";
      loginMessage.classList.remove("hidden");
      console.error("Login error:", error);
    }
  }
  
  async function handleLogout() {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Clear local state
    isAuthenticated = false;
    authToken = null;
    localStorage.removeItem("authToken");
    updateUIForAuth(false);
    
    // Show logout message
    messageDiv.textContent = "Logged out successfully";
    messageDiv.className = "info";
    messageDiv.classList.remove("hidden");
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 3000);
 main
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons only for authenticated users
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn ${isAuthenticated ? '' : 'hidden'}" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    if (!isAuthenticated) {
      messageDiv.textContent = "Please log in to unregister students.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
      return;
    }

    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list and highlights to show updated participants
        fetchParticipationHighlights();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      messageDiv.textContent = "Please log in to register students.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
      return;
    }

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list and highlights to show updated participants
        fetchParticipationHighlights();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Authentication event listeners
  userIcon.addEventListener("click", showLoginModal);
  logoutBtn.addEventListener("click", handleLogout);
  loginForm.addEventListener("submit", handleLogin);
  closeModal.addEventListener("click", hideLoginModal);
  
  // Close modal when clicking outside
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      hideLoginModal();
    }
  });
  
  // Close modal with escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !loginModal.classList.contains("hidden")) {
      hideLoginModal();
    }
  });

  // Initialize app
  fetchParticipationHighlights();
  fetchActivities();
});
