document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  
  // Profile and resume elements
  const profileForm = document.getElementById("profile-form");
  const resumeUploadForm = document.getElementById("resume-upload-form");
  const resumeLinkForm = document.getElementById("resume-link-form");
  const profileMessageDiv = document.getElementById("profile-message");
  const deleteResumeBtn = document.getElementById("delete-resume-btn");
  const resumeDisplay = document.getElementById("resume-display");
  const resumeStatus = document.getElementById("resume-status");
  const resumeInfo = document.getElementById("resume-info");

  // Function to show message
  function showMessage(messageElement, text, className) {
    messageElement.textContent = text;
    messageElement.className = className;
    messageElement.classList.remove("hidden");
    
    setTimeout(() => {
      messageElement.classList.add("hidden");
    }, 5000);
  }

  // Function to load student profile
  async function loadStudentProfile(email) {
    if (!email) return;
    
    try {
      const response = await fetch(`/students/${encodeURIComponent(email)}`);
      const profile = await response.json();
      
      if (response.ok) {
        // Update profile form
        document.getElementById("student-name").value = profile.name || "";
        document.getElementById("student-grade").value = profile.grade || "";
        
        // Update resume display
        updateResumeDisplay(profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  // Function to update resume display
  function updateResumeDisplay(profile) {
    if (profile.resume_type === "file" && profile.resume_file) {
      resumeStatus.textContent = "";
      resumeInfo.innerHTML = `<a href="/resumes/${profile.resume_file}" target="_blank">View Resume File</a>`;
      resumeDisplay.classList.remove("hidden");
    } else if (profile.resume_type === "url" && profile.resume_url) {
      resumeStatus.textContent = "";
      resumeInfo.innerHTML = `<a href="${profile.resume_url}" target="_blank">View Resume URL</a>`;
      resumeDisplay.classList.remove("hidden");
    } else {
      resumeStatus.textContent = "No resume uploaded or linked";
      resumeDisplay.classList.add("hidden");
    }
  }
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
        showMessage(messageDiv, result.message, "success");

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(messageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Failed to unregister. Please try again.", "error");
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
        showMessage(messageDiv, result.message, "success");
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(messageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Handle profile form submission
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("profile-email").value;
    const name = document.getElementById("student-name").value;
    const grade = document.getElementById("student-grade").value;
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("grade", grade);
      
      const response = await fetch(`/students/${encodeURIComponent(email)}/profile`, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showMessage(profileMessageDiv, result.message, "success");
        loadStudentProfile(email);
      } else {
        showMessage(profileMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(profileMessageDiv, "Failed to update profile. Please try again.", "error");
      console.error("Error updating profile:", error);
    }
  });

  // Handle resume upload form submission
  resumeUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("profile-email").value;
    const fileInput = document.getElementById("resume-file");
    const file = fileInput.files[0];
    
    if (!email) {
      showMessage(profileMessageDiv, "Please enter your email address first.", "error");
      return;
    }
    
    if (!file) {
      showMessage(profileMessageDiv, "Please select a file to upload.", "error");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`/students/${encodeURIComponent(email)}/resume/upload`, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showMessage(profileMessageDiv, result.message, "success");
        loadStudentProfile(email);
        resumeUploadForm.reset();
      } else {
        showMessage(profileMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(profileMessageDiv, "Failed to upload resume. Please try again.", "error");
      console.error("Error uploading resume:", error);
    }
  });

  // Handle resume link form submission
  resumeLinkForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("profile-email").value;
    const resumeUrl = document.getElementById("resume-url").value;
    
    if (!email) {
      showMessage(profileMessageDiv, "Please enter your email address first.", "error");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("resume_url", resumeUrl);
      
      const response = await fetch(`/students/${encodeURIComponent(email)}/resume/link`, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showMessage(profileMessageDiv, result.message, "success");
        loadStudentProfile(email);
        resumeLinkForm.reset();
      } else {
        showMessage(profileMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(profileMessageDiv, "Failed to link resume. Please try again.", "error");
      console.error("Error linking resume:", error);
    }
  });

  // Handle delete resume button
  deleteResumeBtn.addEventListener("click", async () => {
    const email = document.getElementById("profile-email").value;
    
    if (!email) {
      showMessage(profileMessageDiv, "Please enter your email address first.", "error");
      return;
    }
    
    if (!confirm("Are you sure you want to delete your resume?")) {
      return;
    }
    
    try {
      const response = await fetch(`/students/${encodeURIComponent(email)}/resume`, {
        method: "DELETE"
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showMessage(profileMessageDiv, result.message, "success");
        loadStudentProfile(email);
      } else {
        showMessage(profileMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(profileMessageDiv, "Failed to delete resume. Please try again.", "error");
      console.error("Error deleting resume:", error);
    }
  });

  // Handle profile email input change
  document.getElementById("profile-email").addEventListener("blur", (event) => {
    const email = event.target.value;
    if (email) {
      loadStudentProfile(email);
    }
  });

  // Initialize app
  fetchActivities();
});
