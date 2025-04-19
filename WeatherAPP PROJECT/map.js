// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", () => {
  console.log("Map page loaded")

  // Check if map container exists
  const mapContainer = document.getElementById("map")
  if (!mapContainer) {
    console.error("Map container not found")
    return
  }

  const city = localStorage.getItem("city")

  if (!city) {
    console.log("No city found in localStorage, using default location")
    // If no city is found, initialize map with a default location
    initializeMap(51.505, -0.09) // Default to London
    alert("No city found. Please go back to the main page and search for a city.")
  } else {
    console.log("City found in localStorage:", city)
    const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

    fetch(weatherUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`City not found: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("Weather data received:", data)
        const lat = data.coord.lat
        const lon = data.coord.lon
        initializeMap(lat, lon, city, data)
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error)
        initializeMap(51.505, -0.09) // Default to London
        alert("Failed to fetch weather map data for the city.")
      })
  }
})

function initializeMap(lat, lon, city, weatherData) {
  console.log("Initializing map at coordinates:", lat, lon)

  try {
    // Initialize the map
    const map = L.map("map").setView([lat, lon], 8)

    // Add the base tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"

    // Add weather layers
    const temperatureLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.9,
      },
    ).addTo(map)

    const precipitationLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.9,
      },
    )

    const windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      attribution: "Weather data © OpenWeatherMap",
      opacity: 0.9,
    })

    const cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      attribution: "Weather data © OpenWeatherMap",
      opacity: 0.7,
    })

    const pressureLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.9,
      },
    )

    // Add layer control to switch between weather layers
    const baseLayers = {
      OpenStreetMap: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }),
    }

    const overlays = {
      Temperature: temperatureLayer,
      Precipitation: precipitationLayer,
      Wind: windLayer,
      Clouds: cloudsLayer,
      Pressure: pressureLayer,
    }

    L.control.layers(baseLayers, overlays).addTo(map)

    // Add a marker for the city if we have weather data
    if (city && weatherData) {
      console.log("Adding marker for city:", city)
      const marker = L.marker([lat, lon]).addTo(map)

      // Convert from Kelvin to Celsius if needed
      const temp =
        weatherData.main.temp >= 100 ? Math.round(weatherData.main.temp - 273.15) : Math.round(weatherData.main.temp)

      const description = weatherData.weather[0].description

      marker
        .bindPopup(`
          <b>${city}</b><br>
          ${temp}°C<br>
          ${description}
        `)
        .openPopup()
    }

    console.log("Map initialized successfully")
  } catch (error) {
    console.error("Error initializing map:", error)
    alert("There was an error initializing the map. Please try again later.")
  }
}
