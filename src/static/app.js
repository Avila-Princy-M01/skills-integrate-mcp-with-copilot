document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  fetchProfiles();
  fetchActivities();
});
