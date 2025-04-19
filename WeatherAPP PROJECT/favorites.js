const citySearch = document.getElementById("city-search");
const addCityBtn = document.getElementById("add-city-btn");
const favoritesContainer = document.getElementById("favorites-container");

const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da";
let favorites = [];

// Initialize the page
function init() {
  loadFavorites();

  addCityBtn.addEventListener("click", addFavorite);
  citySearch.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addFavorite();
    }
  });
}

// Load favorites from localStorage
function loadFavorites() {
  const savedFavorites = localStorage.getItem("favoriteWeatherCities");

  if (savedFavorites) {
    const favoriteNames = JSON.parse(savedFavorites);

    if (favoriteNames.length > 0) {
      favoritesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <p>Loading your favorite locations...</p>
        </div>
      `;

      Promise.all(favoriteNames.map(fetchWeatherData)).then((results) => {
        favorites = results.filter((city) => city !== null);
        renderFavorites();
      });
    } else {
      renderEmptyState();
    }
  } else {
    renderEmptyState();
  }
}

// Add a city to favorites
async function addFavorite() {
  const cityName = citySearch.value.trim();
  if (!cityName) return;

  const savedFavorites = localStorage.getItem("favoriteWeatherCities");
  const favoriteNames = savedFavorites ? JSON.parse(savedFavorites) : [];

  if (favoriteNames.some((name) => name.toLowerCase() === cityName.toLowerCase())) {
    alert("This city is already in your favorites.");
    return;
  }

  try {
    const cityData = await fetchWeatherData(cityName);

    if (cityData) {
      favorites.push(cityData);
      favoriteNames.push(cityData.name);
      localStorage.setItem("favoriteWeatherCities", JSON.stringify(favoriteNames));
      renderFavorites();
      citySearch.value = "";
    }
  } catch (error) {
    alert(`Could not find weather data for "${cityName}". Please check the city name and try again.`);
  }
}

// Fetch weather data for a city
async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      console.error(`Failed to fetch data for ${city}:`, response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      id: Date.now() + Math.random(),
      name: data.name,
      country: data.sys.country,
      weather: data,
    };
  } catch (error) {
    console.error(`Error fetching data for ${city}:`, error);
    return null;
  }
}

// Render favorites
function renderFavorites() {
  if (favorites.length === 0) {
    renderEmptyState();
    return;
  }

  favoritesContainer.innerHTML = "";

  favorites.forEach((city) => {
    const favoriteCard = document.createElement("div");
    favoriteCard.classList.add("favorite-card");

    // Defensive: check if weather and icon exist
    let iconUrl = "https://openweathermap.org/img/wn/01d@2x.png";
    let weatherDesc = "";
    if (
      city.weather &&
      city.weather.weather &&
      Array.isArray(city.weather.weather) &&
      city.weather.weather[0] &&
      city.weather.weather[0].icon
    ) {
      iconUrl = `https://openweathermap.org/img/wn/${city.weather.weather[0].icon}@2x.png`;
      weatherDesc = city.weather.weather[0].description;
    }

    favoriteCard.innerHTML = `
      <div class="card-actions">
        <button class="card-btn remove" data-name="${city.name}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <h3 class="city-name">${city.name}</h3>
      <p class="city-country">${city.country}</p>
      <div class="city-weather">
        <img src="${iconUrl}" alt="${weatherDesc}">
        <p class="city-temp">${Math.round(city.weather.main.temp)}°C</p>
        <p class="city-weather-desc">${weatherDesc}</p>
      </div>
      <div class="city-details">
        <div class="detail-item">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${city.weather.main.humidity}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${city.weather.wind.speed} km/h</span>
        </div>
      </div>
      <button class="view-btn" data-city="${city.name}">View Details</button>
    `;

    favoritesContainer.appendChild(favoriteCard);
  });

  document.querySelectorAll(".card-btn.remove").forEach((btn) => {
    btn.addEventListener("click", removeFavorite);
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", viewCityDetails);
  });
}

// Render empty state
function renderEmptyState() {
  favoritesContainer.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-heart"></i>
      <p>You don't have any favorite locations yet</p>
      <p class="hint">Add cities to your favorites for quick access</p>
    </div>
  `;
}

// Remove a city from favorites
function removeFavorite(e) {
  const cityName = e.currentTarget.getAttribute("data-name");

  if (confirm(`Are you sure you want to remove ${cityName} from your favorites?`)) {
    favorites = favorites.filter((city) => city.name !== cityName);

    const favoriteNames = favorites.map((city) => city.name);
    localStorage.setItem("favoriteWeatherCities", JSON.stringify(favoriteNames));

    renderFavorites();
  }
}

// View city details
function viewCityDetails(e) {
  const cityName = e.currentTarget.getAttribute("data-city");
  localStorage.setItem("city", cityName);
  window.location.href = "home.html";
}

document.addEventListener("DOMContentLoaded", init);
