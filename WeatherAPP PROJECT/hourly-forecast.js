const hourlyContainer = document.getElementById("hourly-scroll-container")
const timeButtons = document.querySelectorAll(".time-btn")
const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"
const city = localStorage.getItem("city")

// Default to 24 hours
let hoursToShow = 24

async function fetchHourlyForecast() {
  if (!city) {
    hourlyContainer.innerHTML = `<h2>No city selected. Please go back to the home page and search for a city.</h2>`
    return
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.cod !== "200") {
      hourlyContainer.innerHTML = `<h2>Failed to fetch data. Try again later.</h2>`
      return
    }

    displayHourlyForecast(data)
  } catch (error) {
    hourlyContainer.innerHTML = `<h2>Error fetching forecast: ${error.message}</h2>`
  }
}

function displayHourlyForecast(data) {
  hourlyContainer.innerHTML = ""

  // OpenWeatherMap provides forecast in 3-hour steps
  const hourlyData = data.list.slice(0, Math.ceil(hoursToShow / 3))

  hourlyData.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const hour = date.getHours()
    const formattedHour = hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`

    const temp = Math.round(item.main.temp)
    const weather = item.weather[0]
    const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`
    const windSpeed = Math.round(item.wind.speed)
    const humidity = item.main.humidity

    const hourlyItem = document.createElement("div")
    hourlyItem.classList.add("hourly-item")

    hourlyItem.innerHTML = `
      <div class="time">${formattedHour}</div>
      <div class="date">${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
      <img src="${iconUrl}" alt="${weather.description}" class="weather-icon"/>
      <div class="temp">${temp}°C</div>
      <div class="details-container">
        <div class="details">${weather.description}</div>
        <div class="details">Wind: ${windSpeed} km/h</div>
        <div class="details">Humidity: ${humidity}%</div>
      </div>
    `

    hourlyContainer.appendChild(hourlyItem)
  })
}

// Event listeners for time buttons
timeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeButtons.forEach((btn) => btn.classList.remove("active"))
    button.classList.add("active")

    hoursToShow = Number.parseInt(button.dataset.hours)
    fetchHourlyForecast()
  })
})

// Initial fetch
fetchHourlyForecast()
