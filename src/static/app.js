document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");
 copilot/fix-7
  const registrationModal = document.getElementById("registration-modal");
  const registrationForm = document.getElementById("registration-form");
  const modalActivityName = document.getElementById("modal-activity-name");
  const closeButton = document.querySelector(".close-button");
  const studentEmailInput = document.getElementById("student-email");
  
  let currentActivity = null;
 copilot/fix-11
  
  // Team management elements
  const teamsList = document.getElementById("teams-list");
  const createTeamForm = document.getElementById("create-team-form");
  const teamMessageDiv = document.getElementById("team-message");
  const teamDetailsSection = document.getElementById("team-details");
  const teamInfoDiv = document.getElementById("team-info");
  const teamMembersDiv = document.getElementById("team-members");
  const teamTasksDiv = document.getElementById("team-tasks");
  const addMemberForm = document.getElementById("add-member-form");
  const createTaskForm = document.getElementById("create-task-form");
  const taskAssignedSelect = document.getElementById("task-assigned");
  
  // Tab management
  const activitiesTab = document.getElementById("activities-tab");
  const teamsTab = document.getElementById("teams-tab");
  const activitiesContent = document.getElementById("activities-content");
  const teamsContent = document.getElementById("teams-content");
  
  let currentTeamId = null;

  // Tab switching functionality
  activitiesTab.addEventListener("click", () => {
    activitiesTab.classList.add("active");
    teamsTab.classList.remove("active");
    activitiesContent.classList.add("active");
    teamsContent.classList.remove("active");
    teamDetailsSection.classList.add("hidden");
  });

  teamsTab.addEventListener("click", () => {
    teamsTab.classList.add("active");
    activitiesTab.classList.remove("active");
    teamsContent.classList.add("active");
    activitiesContent.classList.remove("active");
    fetchTeams();
  });

 copilot/fix-8
  
  // Profile elements
  const profilesList = document.getElementById("profiles-list");
  const profileForm = document.getElementById("profile-form");
  const profileMessageDiv = document.getElementById("profile-message");

  // Function to fetch profiles from API
  async function fetchProfiles() {
    try {
      const response = await fetch("/profiles");
      const profiles = await response.json();

      // Clear loading message
      profilesList.innerHTML = "";

      // Check if profiles exist
      if (Object.keys(profiles).length === 0) {
        profilesList.innerHTML = "<p>No profiles created yet. Create the first profile below!</p>";
        return;
      }

      // Populate profiles list
      Object.entries(profiles).forEach(([email, profile]) => {
        const profileCard = document.createElement("div");
        profileCard.className = "profile-card";

        const createTagsHTML = (items) => {
          return items.map(item => `<span class="profile-tag">${item}</span>`).join("");
        };

        profileCard.innerHTML = `
          <h4>${profile.name}</h4>
          <p><strong>Email:</strong> ${profile.email}</p>
          <p><strong>Grade:</strong> ${profile.grade_level}</p>
          
          ${profile.achievements.length > 0 ? `
            <div class="profile-section">
              <strong>Achievements:</strong>
              <div class="profile-tags">${createTagsHTML(profile.achievements)}</div>
            </div>
          ` : ''}
          
          ${profile.roles.length > 0 ? `
            <div class="profile-section">
              <strong>Roles:</strong>
              <div class="profile-tags">${createTagsHTML(profile.roles)}</div>
            </div>
          ` : ''}
          
          ${profile.skills.length > 0 ? `
            <div class="profile-section">
              <strong>Skills:</strong>
              <div class="profile-tags">${createTagsHTML(profile.skills)}</div>
            </div>
          ` : ''}
          
          ${profile.extracurricular_activities.length > 0 ? `
            <div class="profile-section">
              <strong>Extracurricular Activities:</strong>
              <div class="profile-tags">${createTagsHTML(profile.extracurricular_activities)}</div>
            </div>
          ` : ''}
          
          ${profile.leadership_roles.length > 0 ? `
            <div class="profile-section">
              <strong>Leadership Roles:</strong>
              <div class="profile-tags">${createTagsHTML(profile.leadership_roles)}</div>
            </div>
          ` : ''}
        `;

        profilesList.appendChild(profileCard);
      });
    } catch (error) {
      profilesList.innerHTML = "<p>Error loading profiles. Please try again.</p>";
      console.error("Error fetching profiles:", error);
    }
  }

  // Handle profile form submission
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("profile-email").value;
    const name = document.getElementById("profile-name").value;
    const grade = document.getElementById("profile-grade").value;
    const achievements = document.getElementById("profile-achievements").value
      .split(",").map(s => s.trim()).filter(s => s);
    const roles = document.getElementById("profile-roles").value
      .split(",").map(s => s.trim()).filter(s => s);
    const skills = document.getElementById("profile-skills").value
      .split(",").map(s => s.trim()).filter(s => s);
    const activities = document.getElementById("profile-activities").value
      .split(",").map(s => s.trim()).filter(s => s);
    const leadership = document.getElementById("profile-leadership").value
      .split(",").map(s => s.trim()).filter(s => s);

    const profileData = {
      email,
      name,
      grade_level: grade,
      achievements,
      roles,
      skills,
      extracurricular_activities: activities,
      leadership_roles: leadership
    };

    try {
      // First try to create the profile
      let response = await fetch("/profiles", {

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
 main
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
 copilot/fix-8
        body: JSON.stringify(profileData),
      });

      // If profile already exists, update it
      if (response.status === 400) {
        response = await fetch(`/profiles/${encodeURIComponent(email)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });
      }

      const result = await response.json();

      if (response.ok) {
        profileMessageDiv.textContent = result.message;
        profileMessageDiv.className = "success";
        profileForm.reset();

        // Refresh profiles list
        fetchProfiles();
      } else {
        profileMessageDiv.textContent = result.detail || "An error occurred";
        profileMessageDiv.className = "error";
      }

      profileMessageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        profileMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      profileMessageDiv.textContent = "Failed to save profile. Please try again.";
      profileMessageDiv.className = "error";
      profileMessageDiv.classList.remove("hidden");
      console.error("Error saving profile:", error);
    }
  });

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
 main
 main
 main

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
          <button class="register-btn" data-activity="${name}">Register Student</button>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });

      // Add event listeners to register buttons
      document.querySelectorAll(".register-btn").forEach((button) => {
        button.addEventListener("click", handleRegisterClick);
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

 copilot/fix-7
  // Handle register button click
  function handleRegisterClick(event) {
    const button = event.target;
    currentActivity = button.getAttribute("data-activity");
    modalActivityName.textContent = currentActivity;
    studentEmailInput.value = "";
    registrationModal.classList.remove("hidden");
    registrationModal.style.display = "block";
  }

  // Handle modal close
  function closeModal() {
    registrationModal.classList.add("hidden");
    registrationModal.style.display = "none";
    currentActivity = null;
  }

  // Event listeners for modal
  closeButton.addEventListener("click", closeModal);
  
  window.addEventListener("click", (event) => {
    if (event.target === registrationModal) {
      closeModal();
    }
  });

  // Handle registration form submission
  registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = studentEmailInput.value;

    if (!currentActivity) {
      return;
    }

  // Team management functions
  async function fetchTeams() {
    try {
      const response = await fetch("/teams");
      const teams = await response.json();

      // Clear loading message
      teamsList.innerHTML = "";

      if (Object.keys(teams).length === 0) {
        teamsList.innerHTML = "<p>No teams created yet. Create the first team!</p>";
        return;
      }

      // Populate teams list
      Object.entries(teams).forEach(([id, team]) => {
        const teamCard = document.createElement("div");
        teamCard.className = "team-card";
        teamCard.onclick = () => showTeamDetails(id);

        const memberTags = team.members.map(member => 
          `<span class="member-tag ${member === team.leader ? 'leader-tag' : ''}">${member}</span>`
        ).join(" ");

        teamCard.innerHTML = `
          <h4>${team.name}</h4>
          <p>${team.description}</p>
          <p><strong>Created:</strong> ${new Date(team.created_at).toLocaleDateString()}</p>
          <div class="team-members">
            <h5>Members (${team.members.length}):</h5>
            <div class="member-list">
              ${memberTags}
            </div>
          </div>
          <p><strong>Tasks:</strong> ${team.tasks.length}</p>
        `;

        teamsList.appendChild(teamCard);
      });
    } catch (error) {
      teamsList.innerHTML = "<p>Failed to load teams. Please try again later.</p>";
      console.error("Error fetching teams:", error);
    }
  }

  async function showTeamDetails(teamId) {
    try {
      const response = await fetch(`/teams/${teamId}`);
      const team = await response.json();

      currentTeamId = teamId;
      
      // Show team details section
      teamDetailsSection.classList.remove("hidden");
      
      // Update team info
      teamInfoDiv.innerHTML = `
        <h4>${team.name}</h4>
        <p>${team.description}</p>
        <p><strong>Leader:</strong> ${team.leader}</p>
        <p><strong>Created:</strong> ${new Date(team.created_at).toLocaleDateString()}</p>
      `;

      // Update team members
      const memberTags = team.members.map(member => 
        `<span class="member-tag ${member === team.leader ? 'leader-tag' : ''}">${member}</span>`
      ).join(" ");
      
      teamMembersDiv.innerHTML = `
        <div class="member-list">
          ${memberTags}
        </div>
      `;

      // Update task assignment dropdown
      taskAssignedSelect.innerHTML = '<option value="">-- Unassigned --</option>';
      team.members.forEach(member => {
        const option = document.createElement("option");
        option.value = member;
        option.textContent = member;
        taskAssignedSelect.appendChild(option);
      });

      // Display tasks
      displayTasks(team.tasks);

    } catch (error) {
      console.error("Error fetching team details:", error);
      showMessage("Failed to load team details", "error", teamMessageDiv);
    }
  }

  function displayTasks(tasks) {
    if (tasks.length === 0) {
      teamTasksDiv.innerHTML = "<p>No tasks created yet.</p>";
      return;
    }

    teamTasksDiv.innerHTML = tasks.map(task => `
      <div class="task-card">
        <h5>${task.title}</h5>
        <p>${task.description}</p>
        <p><strong>Assigned to:</strong> ${task.assigned_to || 'Unassigned'}</p>
        <p><strong>Status:</strong> <span class="task-status status-${task.status}">${task.status.replace('_', ' ')}</span></p>
        <p><strong>Due:</strong> ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
        <div class="task-actions">
          ${task.status === 'pending' ? `<button class="btn-start" onclick="updateTaskStatus('${task.id}', 'in_progress')">Start</button>` : ''}
          ${task.status === 'in_progress' ? `<button class="btn-complete" onclick="updateTaskStatus('${task.id}', 'completed')">Complete</button>` : ''}
          ${task.status === 'completed' ? `<button class="btn-start" onclick="updateTaskStatus('${task.id}', 'in_progress')">Reopen</button>` : ''}
          <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      </div>
    `).join("");
  }

  // Helper function to show messages
  function showMessage(message, type, messageElement) {
    messageElement.textContent = message;
    messageElement.className = type;
    messageElement.classList.remove("hidden");

    setTimeout(() => {
      messageElement.classList.add("hidden");
    }, 5000);
  }

  // Create team form handler
  createTeamForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const teamName = document.getElementById("team-name").value;
    const teamDescription = document.getElementById("team-description").value;
    const teamLeader = document.getElementById("team-leader").value;

    try {
      const response = await fetch("/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          leader: teamLeader,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success", teamMessageDiv);
        createTeamForm.reset();
        fetchTeams();
      } else {
        showMessage(result.detail || "An error occurred", "error", teamMessageDiv);
      }
    } catch (error) {
      showMessage("Failed to create team. Please try again.", "error", teamMessageDiv);
      console.error("Error creating team:", error);
    }
  });

  // Add member form handler
  addMemberForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const memberEmail = document.getElementById("member-email").value;

    try {
      const response = await fetch(`/teams/${currentTeamId}/members?email=${encodeURIComponent(memberEmail)}`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success", teamMessageDiv);
        document.getElementById("member-email").value = "";
        showTeamDetails(currentTeamId); // Refresh team details
      } else {
        showMessage(result.detail || "An error occurred", "error", teamMessageDiv);
      }
    } catch (error) {
      showMessage("Failed to add member. Please try again.", "error", teamMessageDiv);
      console.error("Error adding member:", error);
    }
  });

  // Create task form handler
  createTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById("task-title").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskAssigned = document.getElementById("task-assigned").value;
    const taskDue = document.getElementById("task-due").value;

    try {
      const response = await fetch(`/teams/${currentTeamId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assigned_to: taskAssigned || null,
          due_date: taskDue || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success", teamMessageDiv);
        createTaskForm.reset();
        showTeamDetails(currentTeamId); // Refresh team details
      } else {
        showMessage(result.detail || "An error occurred", "error", teamMessageDiv);
      }
    } catch (error) {
      showMessage("Failed to create task. Please try again.", "error", teamMessageDiv);
      console.error("Error creating task:", error);
    }
  });

  // Global functions for task management
  window.updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/teams/${currentTeamId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success", teamMessageDiv);
        showTeamDetails(currentTeamId); // Refresh team details
      } else {
        showMessage(result.detail || "An error occurred", "error", teamMessageDiv);
      }
    } catch (error) {
      showMessage("Failed to update task status. Please try again.", "error", teamMessageDiv);
      console.error("Error updating task status:", error);
    }
  };

  window.deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`/teams/${currentTeamId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success", teamMessageDiv);
        showTeamDetails(currentTeamId); // Refresh team details
      } else {
        showMessage(result.detail || "An error occurred", "error", teamMessageDiv);
      }
    } catch (error) {
      showMessage("Failed to delete task. Please try again.", "error", teamMessageDiv);
      console.error("Error deleting task:", error);
    }
  };

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
 main

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          currentActivity
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
        closeModal();

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
      messageDiv.textContent = "Failed to register. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error registering:", error);
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
 copilot/fix-8
  fetchProfiles();

  fetchParticipationHighlights();
 main
  fetchActivities();
});
