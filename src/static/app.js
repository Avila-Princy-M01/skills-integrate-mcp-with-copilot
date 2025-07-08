document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  
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

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
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
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
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

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
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

  // Initialize app
  fetchActivities();
});
