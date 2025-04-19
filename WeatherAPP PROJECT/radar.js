const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da";
const city = localStorage.getItem("city") || "London"; // fallback for demo
const radarMap = document.getElementById("radar-map");
const radarLocation = document.getElementById("radar-location");
const lastUpdated = document.getElementById("last-updated");
const playPauseBtn = document.getElementById("play-pause");
const stepBackBtn = document.getElementById("step-back");
const stepForwardBtn = document.getElementById("step-forward");
const timeRange = document.getElementById("time-range");

// Layer checkboxes
const precipitationCheck = document.getElementById("precipitation");
const cloudsCheck = document.getElementById("clouds");
const pressureCheck = document.getElementById("pressure");
const windCheck = document.getElementById("wind");
const temperatureCheck = document.getElementById("temperature");

let map;
let currentLayers = [];
let isPlaying = false;
let currentTimeIndex = 10; // Start at the most recent frame
let animationInterval;

async function initMap() {
  if (!city || city.trim() === "") {
    radarMap.innerHTML = `<div class="error-message">No city selected. Go back and choose a location first.</div>`;
    return;
  }

  try {
    // Get coordinates for the city
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(geoUrl);
    const data = await response.json();

    if (data.cod !== 200) {
      radarMap.innerHTML = `<div class="error-message">Failed to fetch location data. Try again later.</div>`;
      return;
    }

    const { lat, lon } = data.coord;
    radarLocation.textContent = `${data.name}, ${data.sys.country}`;
    lastUpdated.textContent = new Date().toLocaleString();

    // Remove previous map if exists
    if (map) {
      map.remove();
    }
    // Initialize Leaflet map with the container ID string
    map = L.map('radar-map').setView([lat, lon], 8);

    // Add base tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    updateLayers();

    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${data.name}</b><br>${data.weather[0].description}`)
      .openPopup();
  } catch (error) {
    radarMap.innerHTML = `<div class="error-message">Error initializing map: ${error.message}</div>`;
  }
}

// Update map layers based on checkbox selections
function updateLayers() {
  // Remove existing layers
  currentLayers.forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  currentLayers = [];

  // Add selected layers
  if (precipitationCheck.checked) {
    const precipLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.8,
      }
    );
    precipLayer.addTo(map);
    currentLayers.push(precipLayer);
  }

  if (cloudsCheck.checked) {
    const cloudsLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.7,
      }
    );
    cloudsLayer.addTo(map);
    currentLayers.push(cloudsLayer);
  }

  if (pressureCheck.checked) {
    const pressureLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.7,
      }
    );
    pressureLayer.addTo(map);
    currentLayers.push(pressureLayer);
  }

  if (windCheck.checked) {
    const windLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.7,
      }
    );
    windLayer.addTo(map);
    currentLayers.push(windLayer);
  }

  if (temperatureCheck.checked) {
    const tempLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution: "Weather data © OpenWeatherMap",
        opacity: 0.7,
      }
    );
    tempLayer.addTo(map);
    currentLayers.push(tempLayer);
  }

  // Update timestamp
  lastUpdated.textContent = new Date().toLocaleString();

  // Visual feedback
  flashMapOutline();
  updateActiveLayersDisplay();
  console.log("Layers updated:", {
    precipitation: precipitationCheck.checked,
    clouds: cloudsCheck.checked,
    pressure: pressureCheck.checked,
    wind: windCheck.checked,
    temperature: temperatureCheck.checked
  });
}

// Animation controls
function togglePlayPause() {
  if (isPlaying) {
    clearInterval(animationInterval);
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    animationInterval = setInterval(() => {
      currentTimeIndex = (currentTimeIndex + 1) % 11;
      timeRange.value = currentTimeIndex;
      updateRadarFrame();
    }, 1000);
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

function stepBack() {
  currentTimeIndex = Math.max(0, currentTimeIndex - 1);
  timeRange.value = currentTimeIndex;
  updateRadarFrame();
}

function stepForward() {
  currentTimeIndex = Math.min(10, currentTimeIndex + 1);
  timeRange.value = currentTimeIndex;
  updateRadarFrame();
}

function updateRadarFrame() {
  // In a real app, this would load different timestamped radar images
  // For this demo, we'll just update the timestamp
  const now = new Date();
  const frameTime = new Date(now.getTime() - (10 - currentTimeIndex) * 20 * 60000);
  lastUpdated.textContent = frameTime.toLocaleString();
}

// Visual feedback for layer change
function flashMapOutline() {
  radarMap.style.boxShadow = '0 0 0 4px #2196f3';
  setTimeout(() => {
    radarMap.style.boxShadow = '';
  }, 300);
}

// Show which layers are active
function updateActiveLayersDisplay() {
  const active = [];
  if (precipitationCheck.checked) active.push('Precipitation');
  if (cloudsCheck.checked) active.push('Clouds');
  if (pressureCheck.checked) active.push('Pressure');
  if (windCheck.checked) active.push('Wind');
  if (temperatureCheck.checked) active.push('Temperature');
  document.getElementById('active-layers').textContent = "Active Layers: " + (active.length ? active.join(', ') : 'None');
}

// Event listeners
precipitationCheck.addEventListener("change", updateLayers);
cloudsCheck.addEventListener("change", updateLayers);
pressureCheck.addEventListener("change", updateLayers);
windCheck.addEventListener("change", updateLayers);
temperatureCheck.addEventListener("change", updateLayers);

playPauseBtn.addEventListener("click", togglePlayPause);
stepBackBtn.addEventListener("click", stepBack);
stepForwardBtn.addEventListener("click", stepForward);

timeRange.addEventListener("input", () => {
  currentTimeIndex = Number.parseInt(timeRange.value);
  updateRadarFrame();
});

// Initialize the map when the page loads
window.addEventListener("load", initMap);
