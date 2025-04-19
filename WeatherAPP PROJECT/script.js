const inputBox = document.querySelector(".input-box")
const searchBtn = document.getElementById("searchBtn")
const weather_img = document.querySelector(".weather-img")
const small_icon = document.getElementById("small-icon")
const temperature = document.querySelector(".temperature")
const description = document.querySelector(".description")
const humidity = document.getElementById("humidity")
const wind_speed = document.getElementById("wind-speed")
const location_not_found = document.querySelector(".location-not-found")
const weather_body = document.querySelector(".weather-body")
const location_id = document.getElementById("locationid")
const cancelBtn = document.getElementById("cancelBtn")
const additionalInfo = document.querySelector(".additional-info")
const favoriteBtn = document.querySelector(".favorite-btn")

let currentCity = ""

async function showData(url) {
  const weather_data = await fetch(`${url}`).then((response) => response.json())

  if (weather_data.cod === `404`) {
    location_not_found.style.display = "flex"
    weather_body.style.display = "none"
    return
  } else {
    location_not_found.style.display = "none"
    weather_body.style.display = "flex"
  }

  temperature.innerHTML = `${Math.round(weather_data.main.temp - 273.15)}°C`
  description.innerHTML = `${weather_data.weather[0].description}`
  humidity.innerHTML = `${weather_data.main.humidity}%`
  wind_speed.innerHTML = `${weather_data.wind.speed}Km/H`

  // Update weather image based on weather condition
  switch (weather_data.weather[0].main) {
    case "Clouds":
      weather_img.src = "/assets/cloud.png"
      break
    case "Clear":
      weather_img.src = "/assets/clear.png"
      break
    case "Rain":
      weather_img.src = "/assets/rain.png"
      break
    case "Mist":
      weather_img.src = "/assets/mist.png"
      break
    case "Snow":
      weather_img.src = "/assets/snow.png"
      break
    case "Haze":
      weather_img.src = "/assets/Haze.png"
      break
    case "Overcast":
      weather_img.src = "/assets/Overcast.png"
      break
    case "Smoke":
      weather_img.src = "/assets/smoke.webp"
      break
    default:
      weather_img.src = "/assets/cloud.png"
  }

  small_icon.src = `https://openweathermap.org/img/wn/${weather_data.weather[0].icon}.png`

  // Update additional info
  updateAdditionalInfo(weather_data)

  // Update favorite button
  updateFavoriteButton(weather_data.name)

  currentCity = weather_data.name
  localStorage.setItem("city", currentCity)
  localStorage.setItem("weatherData", JSON.stringify(weather_data))
}

function updateAdditionalInfo(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const visibility = (data.visibility / 1000).toFixed(1)
  const feelsLike = Math.round(data.main.feels_like - 273.15)

  additionalInfo.innerHTML = `
    <div class="info-card">
      <span class="info-title">Feels Like</span>
      <span class="info-value">${feelsLike}°C</span>
    </div>
    <div class="info-card">
      <span class="info-title">Visibility</span>
      <span class="info-value">${visibility} km</span>
    </div>
    <div class="info-card">
      <span class="info-title">Sunrise</span>
      <span class="info-value">${sunrise}</span>
    </div>
    <div class="info-card">
      <span class="info-title">Sunset</span>
      <span class="info-value">${sunset}</span>
    </div>
  `
}

function updateFavoriteButton(cityName) {
  const favorites = localStorage.getItem("favoriteWeatherCities")
  const favoritesList = favorites ? JSON.parse(favorites) : []

  if (favoritesList.includes(cityName)) {
    favoriteBtn.classList.add("active")
    favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>'
  } else {
    favoriteBtn.classList.remove("active")
    favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>'
  }
}

function toggleFavorite() {
  if (!currentCity) return

  const favorites = localStorage.getItem("favoriteWeatherCities")
  let favoritesList = favorites ? JSON.parse(favorites) : []

  if (favoritesList.includes(currentCity)) {
    // Remove from favorites
    favoritesList = favoritesList.filter((city) => city !== currentCity)
    favoriteBtn.classList.remove("active")
    favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>'
  } else {
    // Add to favorites
    favoritesList.push(currentCity)
    favoriteBtn.classList.add("active")
    favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>'
  }

  localStorage.setItem("favoriteWeatherCities", JSON.stringify(favoritesList))
}

function checkWeather(city) {
  const api_key = "19eb282dbdaa3815c081dbcbcc0af5da"
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`

  showData(url)
}

function geolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  } else {
    location_id.innerHTML = "Geolocation is not supported by your browser!"
  }
}

function showPosition(data) {
  const lat = data.coords.latitude
  const lon = data.coords.longitude

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=19eb282dbdaa3815c081dbcbcc0af5da`

  fetch(url)
    .then((response) => response.json())
    .then((weather_data) => {
      if (weather_data.cod === `404`) {
        location_not_found.style.display = "flex"
        weather_body.style.display = "none"
        return
      } else {
        location_not_found.style.display = "none"
        weather_body.style.display = "flex"
      }
      inputBox.value = weather_data.name
      showData(url)

      localStorage.setItem("city", weather_data.name)
    })
    .catch(() => {
      location_id.innerHTML = "Failed to fetch location details!"
    })
}

function clearField() {
  document.getElementById("searchBox").value = ""
  weather_body.style.display = "none"
}

// Event listeners
searchBtn.addEventListener("click", () => {
  checkWeather(inputBox.value)
})

locationid.addEventListener("click", () => {
  geolocation()
  clearField()
})

cancelBtn.addEventListener("click", () => {
  clearField()
})

favoriteBtn.addEventListener("click", toggleFavorite)

// Initialize on page load
window.addEventListener("load", () => {
  const savedCity = localStorage.getItem("city")
  const savedWeatherData = localStorage.getItem("weatherData")
  if (savedCity) {
    inputBox.value = savedCity
  }
  if (savedCity && savedWeatherData) {
    const weatherData = JSON.parse(savedWeatherData)
    showData(`https://api.openweathermap.org/data/2.5/weather?q=${savedCity}&appid=19eb282dbdaa3815c081dbcbcc0af5da`)
  }
})
