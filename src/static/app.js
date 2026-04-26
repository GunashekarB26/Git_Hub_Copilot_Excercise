document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

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

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants section
        let participantsHTML = "";
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `<li>${p}</li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section empty">
              <strong>Participants:</strong>
              <span class="no-participants">No participants yet</span>
            </div>
          `;
        }
          // Create participants section with delete icon and no bullet points
          let participantsHTML = "";
          if (details.participants && details.participants.length > 0) {
            participantsHTML = `
              <div class="participants-section">
                <strong>Participants:</strong>
                <ul class="participants-list no-bullets">
                  ${details.participants
                    .map(
                      (p) => `
                        <li class="participant-item">
                          <span class="participant-email">${p}</span>
                          <button class="delete-participant" title="Remove participant" data-activity="${encodeURIComponent(
                            name
                          )}" data-email="${encodeURIComponent(
                            p
                          )}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#ffebee"/><path d="M9.5 9.5l5 5m0-5l-5 5" stroke="#c62828" stroke-width="2" stroke-linecap="round"/></svg>
                          </button>
                        </li>
                      `
                    )
                    .join("")}
                </ul>
              </div>
            `;
          } else {
            participantsHTML = `
              <div class="participants-section empty">
                <strong>Participants:</strong>
                <span class="no-participants">No participants yet</span>
              </div>
            `;
          }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show the new participant
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

    // Delegate click event for delete participant buttons
    document.addEventListener("click", async (event) => {
      const target = event.target.closest(".delete-participant");
      if (target) {
        const activity = decodeURIComponent(target.getAttribute("data-activity"));
        const email = decodeURIComponent(target.getAttribute("data-email"));
        if (!activity || !email) return;
        if (!confirm(`Remove ${email} from ${activity}?`)) return;
        try {
          const response = await fetch(
            `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
            { method: "POST" }
          );
          if (response.ok) {
            fetchActivities();
          } else {
            const result = await response.json();
            alert(result.detail || "Failed to remove participant.");
          }
        } catch (error) {
          alert("Error removing participant. Please try again.");
          console.error("Error unregistering participant:", error);
        }
      }
    });
  // Initialize app
  fetchActivities();
});
