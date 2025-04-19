const alertsList = document.getElementById("alerts-list")
const alertLocation = document.getElementById("alert-location")
const severityFilter = document.getElementById("severity-filter")
const saveNotificationsBtn = document.getElementById("save-notifications")
const enableNotifications = document.getElementById("enable-notifications")
const severeNotifications = document.getElementById("severe-notifications")
const precipitationNotifications = document.getElementById("precipitation-notifications")
const temperatureNotifications = document.getElementById("temperature-notifications")

const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"
const city = localStorage.getItem("city")

// Sample alert data (in a real app, this would come from an API)
const sampleAlerts = [
  {
    id: 1,
    title: "Severe Thunderstorm Warning",
    description:
      "The National Weather Service has issued a severe thunderstorm warning for your area. Expect heavy rain, lightning, and possible hail. Take necessary precautions and stay indoors if possible.",
    time: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(), // 30 minutes ago
    severity: "severe",
    source: "National Weather Service",
  },
  {
    id: 2,
    title: "Flash Flood Watch",
    description:
      "A flash flood watch is in effect for your area due to expected heavy rainfall. Be prepared for possible flooding in low-lying areas and near streams and creeks.",
    time: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(), // 2 hours ago
    severity: "moderate",
    source: "National Weather Service",
  },
  {
    id: 3,
    title: "High Wind Advisory",
    description:
      "Winds of 20-30 mph with gusts up to 45 mph are expected in your area. Secure loose outdoor objects and be cautious while driving, especially in high-profile vehicles.",
    time: new Date(Date.now() - 1000 * 60 * 240).toLocaleString(), // 4 hours ago
    severity: "minor",
    source: "National Weather Service",
  },
  {
    id: 4,
    title: "Heat Advisory",
    description:
      "A heat advisory is in effect for your area. Temperatures are expected to reach 95-100°F with high humidity. Stay hydrated and limit outdoor activities during peak heat hours.",
    time: new Date(Date.now() - 1000 * 60 * 360).toLocaleString(), // 6 hours ago
    severity: "moderate",
    source: "National Weather Service",
  },
]

// Load alerts for the current city
async function loadAlerts() {
  if (!city) {
    alertsList.innerHTML = `<div class="no-alerts">No city selected. Please go back to the home page and search for a city.</div>`
    alertLocation.textContent = "No city selected"
    return
  }

  try {
    // In a real app, you would fetch alerts from a weather API
    // For this demo, we'll use the sample data and add a delay to simulate API call
    alertLocation.textContent = city

    setTimeout(() => {
      displayAlerts(sampleAlerts)
    }, 1500)
  } catch (error) {
    alertsList.innerHTML = `<div class="no-alerts">Error loading alerts: ${error.message}</div>`
  }
}

// Display alerts in the UI
function displayAlerts(alerts) {
  const currentFilter = severityFilter.value

  // Filter alerts based on selected severity
  const filteredAlerts = currentFilter === "all" ? alerts : alerts.filter((alert) => alert.severity === currentFilter)

  if (filteredAlerts.length === 0) {
    alertsList.innerHTML = `<div class="no-alerts">No ${currentFilter !== "all" ? currentFilter : ""} alerts for your area at this time.</div>`
    return
  }

  alertsList.innerHTML = ""

  filteredAlerts.forEach((alert) => {
    const alertElement = document.createElement("div")
    alertElement.classList.add("alert-item", alert.severity)

    alertElement.innerHTML = `
      <div class="alert-header">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-time">${alert.time}</div>
      </div>
      <div class="alert-description">${alert.description}</div>
      <div class="alert-footer">
        <div class="alert-source">Source: ${alert.source}</div>
        <div class="alert-severity ${alert.severity}">${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</div>
      </div>
    `

    // Add click event to expand/collapse alert details
    alertElement.addEventListener("click", () => {
      alertElement.classList.toggle("expanded")
    })

    alertsList.appendChild(alertElement)
  })
}

// Save notification settings
function saveNotificationSettings() {
  const settings = {
    enabled: enableNotifications.checked,
    severe: severeNotifications.checked,
    precipitation: precipitationNotifications.checked,
    temperature: temperatureNotifications.checked,
  }

  localStorage.setItem("notificationSettings", JSON.stringify(settings))

  // Show confirmation message
  const saveBtn = document.getElementById("save-notifications")
  const originalText = saveBtn.textContent
  saveBtn.textContent = "Settings Saved!"
  saveBtn.style.background = "rgba(46, 204, 113, 0.3)"

  setTimeout(() => {
    saveBtn.textContent = originalText
    saveBtn.style.background = ""
  }, 2000)
}

// Load saved notification settings
function loadNotificationSettings() {
  const savedSettings = localStorage.getItem("notificationSettings")

  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    enableNotifications.checked = settings.enabled
    severeNotifications.checked = settings.severe
    precipitationNotifications.checked = settings.precipitation
    temperatureNotifications.checked = settings.temperature

    // Disable sub-options if main toggle is off
    if (!settings.enabled) {
      document.querySelectorAll(".notification-types input").forEach((input) => {
        input.disabled = true
      })
    }
  }
}

// Event listeners
severityFilter.addEventListener("change", () => {
  displayAlerts(sampleAlerts)
})

enableNotifications.addEventListener("change", (e) => {
  const subOptions = document.querySelectorAll(".notification-types input")
  subOptions.forEach((input) => {
    input.disabled = !e.target.checked
  })
})

saveNotificationsBtn.addEventListener("click", saveNotificationSettings)

// Initialize the page
window.addEventListener("load", () => {
  loadAlerts()
  loadNotificationSettings()
})
