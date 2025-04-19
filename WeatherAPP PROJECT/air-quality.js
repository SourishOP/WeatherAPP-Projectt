const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"
const city = localStorage.getItem("city")
const aqiGauge = document.getElementById("aqi-gauge")
const aqiValue = document.getElementById("aqi-value")
const aqiLabel = document.getElementById("aqi-label")
const aqiLocation = document.getElementById("aqi-location")
const lastUpdated = document.getElementById("last-updated")
const aqiRecommendation = document.getElementById("aqi-recommendation")
const pollutantsGrid = document.getElementById("pollutants-grid")
const forecastGrid = document.getElementById("forecast-grid")
const gaugeProgress = document.getElementById("gauge-progress")

// Sample AQI data (in a real app, this would come from an API)
const sampleAQIData = {
  aqi: 42,
  category: "Good",
  color: "#4CAF50",
  pollutants: [
    { name: "PM2.5", value: 10.2, unit: "μg/m³", icon: "fa-solid fa-smog" },
    { name: "PM10", value: 18.5, unit: "μg/m³", icon: "fa-solid fa-wind" },
    { name: "O3", value: 68, unit: "μg/m³", icon: "fa-solid fa-sun" },
    { name: "NO2", value: 12.3, unit: "μg/m³", icon: "fa-solid fa-car" },
    { name: "SO2", value: 3.8, unit: "μg/m³", icon: "fa-solid fa-industry" },
    { name: "CO", value: 0.8, unit: "mg/m³", icon: "fa-solid fa-fire" },
  ],
  forecast: [
    { day: "Today", aqi: 42, category: "Good", color: "#4CAF50" },
    { day: "Tomorrow", aqi: 58, category: "Moderate", color: "#FFC107" },
    { day: "Wed", aqi: 65, category: "Moderate", color: "#FFC107" },
    { day: "Thu", aqi: 48, category: "Good", color: "#4CAF50" },
    { day: "Fri", aqi: 38, category: "Good", color: "#4CAF50" },
    { day: "Sat", aqi: 45, category: "Good", color: "#4CAF50" },
    { day: "Sun", aqi: 52, category: "Moderate", color: "#FFC107" },
  ],
  recommendations: {
    Good: "Air quality is considered satisfactory, and air pollution poses little or no risk. Enjoy outdoor activities.",
    Moderate:
      "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
    "Unhealthy for Sensitive Groups":
      "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
    Unhealthy:
      "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
    "Very Unhealthy": "Health warnings of emergency conditions. The entire population is more likely to be affected.",
    Hazardous: "Health alert: everyone may experience more serious health effects. Avoid outdoor activities.",
  },
}

// Load air quality data for the current city
async function loadAirQuality() {
  if (!city) {
    aqiValue.textContent = "--"
    aqiLabel.textContent = "No city selected"
    aqiLocation.textContent = "No city selected"
    aqiRecommendation.innerHTML = `<p>Please go back to the home page and search for a city.</p>`
    pollutantsGrid.innerHTML = `<div class="no-data">No city selected</div>`
    forecastGrid.innerHTML = `<div class="no-data">No city selected</div>`
    return
  }

  try {
    // In a real app, you would fetch air quality data from an API
    // For this demo, we'll use the sample data and add a delay to simulate API call
    aqiLocation.textContent = city
    lastUpdated.textContent = new Date().toLocaleString()

    setTimeout(() => {
      displayAirQuality(sampleAQIData)
    }, 1500)
  } catch (error) {
    aqiValue.textContent = "--"
    aqiLabel.textContent = "Error"
    aqiRecommendation.innerHTML = `<p>Error loading air quality data: ${error.message}</p>`
  }
}

// Display air quality data in the UI
function displayAirQuality(data) {
  // Update AQI value and label
  aqiValue.textContent = data.aqi
  aqiLabel.textContent = data.category

  // Update gauge
  const gaugeOffset = 314 - (data.aqi / 500) * 314 // 314 is the circumference of the circle (2 * PI * r)
  gaugeProgress.style.strokeDashoffset = gaugeOffset
  gaugeProgress.style.stroke = data.color

  // Update recommendation
  aqiRecommendation.innerHTML = `
    <p><strong>Health Recommendation:</strong></p>
    <p>${data.recommendations[data.category]}</p>
  `

  // Display pollutants
  pollutantsGrid.innerHTML = ""
  data.pollutants.forEach((pollutant) => {
    const pollutantElement = document.createElement("div")
    pollutantElement.classList.add("pollutant-item")

    pollutantElement.innerHTML = `
      <div class="pollutant-icon"><i class="${pollutant.icon}"></i></div>
      <div class="pollutant-name">${pollutant.name}</div>
      <div class="pollutant-value">${pollutant.value} <span class="pollutant-unit">${pollutant.unit}</span></div>
    `

    pollutantsGrid.appendChild(pollutantElement)
  })

  // Display forecast
  forecastGrid.innerHTML = ""
  data.forecast.forEach((day) => {
    const forecastElement = document.createElement("div")
    forecastElement.classList.add("forecast-item")

    forecastElement.innerHTML = `
      <div class="forecast-day">${day.day}</div>
      <div class="forecast-aqi">${day.aqi}</div>
      <div class="forecast-label" style="background: ${day.color}80">${day.category}</div>
    `

    forecastGrid.appendChild(forecastElement)
  })
}

// Initialize the page
window.addEventListener("load", loadAirQuality)
