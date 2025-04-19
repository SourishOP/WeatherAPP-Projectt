// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  // First, check if Chart.js is properly loaded
  if (typeof Chart === "undefined") {
    console.error("Chart.js is not loaded! Please check your script tags.");
    alert("Error: Chart.js library not found. The comparison charts will not work.");
  } else {
    console.log("Chart.js is loaded successfully");
  }

  // Get DOM elements
  const citySearch = document.getElementById("city-search");
  const addCityBtn = document.getElementById("add-city-btn");
  const compareFavoritesBtn = document.getElementById("compare-favorites");
  const clearAllBtn = document.getElementById("clear-all");
  const comparisonContainer = document.getElementById("comparison-container");
  const currentComparison = document.getElementById("current-comparison");
  const forecastComparison = document.getElementById("forecast-comparison");
  const detailsComparison = document.getElementById("details-comparison");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const chartTypeSelect = document.getElementById("chart-type");
  const comparisonChart = document.getElementById("comparison-chart");

  const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da";
  let cities = [];
  let chart = null;

  // Initialize the page
  function init() {
    // Load saved cities from localStorage
    const savedCities = localStorage.getItem("comparisonCities");
    if (savedCities) {
      try {
        cities = JSON.parse(savedCities);
        renderCityCards();
      } catch (error) {
        console.error("Error parsing saved cities:", error);
        cities = [];
      }
    }

    // Set up event listeners
    if (addCityBtn) {
      addCityBtn.addEventListener("click", addCity);
    }
    if (citySearch) {
      citySearch.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          addCity();
        }
      });
    }
    if (compareFavoritesBtn) {
      compareFavoritesBtn.addEventListener("click", loadFavorites);
    }
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", clearAll);
    }

    // Tab functionality
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const tabId = button.getAttribute("data-tab") + "-tab";
        tabPanes.forEach((pane) => pane.classList.remove("active"));
        const tabPane = document.getElementById(tabId);
        if (tabPane) {
          tabPane.classList.add("active");
          if (tabId === "charts-tab" && cities.length > 0) {
            setTimeout(renderChart, 100);
          }
        }
      });
    });

    // Chart type change
    if (chartTypeSelect) {
      chartTypeSelect.addEventListener("change", renderChart);
    }
  }

  // Add a city to comparison
  async function addCity() {
    const cityName = citySearch ? citySearch.value.trim() : "";
    if (!cityName) return;
    if (cities.length >= 4) {
      alert("You can compare up to 4 cities at a time. Please remove a city first.");
      return;
    }
    if (cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase())) {
      alert("This city is already in your comparison.");
      return;
    }
    try {
      const weatherData = await fetchWeatherData(cityName);
      const forecastData = await fetchForecastData(cityName);
      const cityData = {
        id: Date.now(),
        name: weatherData.name,
        country: weatherData.sys.country,
        weather: weatherData,
        forecast: forecastData,
        isFavorite: false,
      };
      cities.push(cityData);
      saveCities();
      renderCityCards();
      if (citySearch) citySearch.value = "";
      if (document.getElementById("charts-tab")?.classList.contains("active")) {
        setTimeout(renderChart, 100);
      }
    } catch (error) {
      alert(`Could not find weather data for "${cityName}". Please check the city name and try again.`);
    }
  }

  // Fetch current weather data for a city
  async function fetchWeatherData(city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error(`City not found: ${response.status}`);
    return await response.json();
  }

  // Fetch 5-day forecast data for a city
  async function fetchForecastData(city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error(`Forecast data not available: ${response.status}`);
    return await response.json();
  }

  // Render city cards in the comparison container
  function renderCityCards() {
    if (!comparisonContainer || !currentComparison || !forecastComparison || !detailsComparison) {
      return;
    }
    if (cities.length === 0) {
      comparisonContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-city"></i>
          <p>Add cities to compare their weather conditions</p>
          <p class="hint">You can add up to 4 cities for comparison</p>
        </div>
      `;
      currentComparison.innerHTML = "";
      forecastComparison.innerHTML = "";
      detailsComparison.innerHTML = "";
      return;
    }
    comparisonContainer.innerHTML = "";
    currentComparison.innerHTML = "";
    forecastComparison.innerHTML = "";
    detailsComparison.innerHTML = "";

    cities.forEach((city) => {
      // Main comparison card
      const cityCard = document.createElement("div");
      cityCard.classList.add("city-card");
      cityCard.innerHTML = `
        <div class="card-actions">
          <button class="card-btn favorite ${city.isFavorite ? "active" : ""}" data-id="${city.id}">
            <i class="fa-${city.isFavorite ? "solid" : "regular"} fa-heart"></i>
          </button>
          <button class="card-btn remove" data-id="${city.id}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <h3 class="city-name">${city.name}</h3>
        <p class="city-country">${city.country}</p>
        <div class="city-weather">
          <img src="https://openweathermap.org/img/wn/${city.weather.weather[0].icon}@2x.png" alt="${city.weather.weather[0].description}">
          <p class="city-temp">${Math.round(city.weather.main.temp)}°C</p>
          <p class="city-weather-desc">${city.weather.weather[0].description}</p>
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
      `;
      comparisonContainer.appendChild(cityCard);

      // Current weather comparison
      const currentCard = document.createElement("div");
      currentCard.classList.add("city-card");
      currentCard.innerHTML = `
        <h3 class="city-name">${city.name}</h3>
        <div class="city-weather">
          <img src="https://openweathermap.org/img/wn/${city.weather.weather[0].icon}@2x.png" alt="${city.weather.weather[0].description}">
          <p class="city-temp">${Math.round(city.weather.main.temp)}°C</p>
          <p class="city-weather-desc">${city.weather.weather[0].description}</p>
        </div>
        <div class="city-details">
          <div class="detail-item">
            <span class="detail-label">Feels Like</span>
            <span class="detail-value">${Math.round(city.weather.main.feels_like)}°C</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${city.weather.main.humidity}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Wind</span>
            <span class="detail-value">${city.weather.wind.speed} km/h</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pressure</span>
            <span class="detail-value">${city.weather.main.pressure} hPa</span>
          </div>
        </div>
      `;
      currentComparison.appendChild(currentCard);

      // 5-day forecast comparison
      const forecastCard = document.createElement("div");
      forecastCard.classList.add("city-card");
      const dailyForecasts = groupForecastByDay(city.forecast.list);
      let forecastHTML = `<h3 class="city-name">${city.name}</h3><div class="forecast-days">`;
      Object.keys(dailyForecasts)
        .slice(0, 5)
        .forEach((day) => {
          const forecast = dailyForecasts[day];
          forecastHTML += `
          <div class="forecast-day">
            <div class="day-name">${new Date(day).toLocaleDateString(undefined, { weekday: "short" })}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
            <div class="forecast-temp">
              <span class="max">${Math.round(forecast.maxTemp)}°</span>
              <span class="min">${Math.round(forecast.minTemp)}°</span>
            </div>
          </div>
        `;
        });
      forecastHTML += `</div>`;
      forecastCard.innerHTML = forecastHTML;
      forecastComparison.appendChild(forecastCard);

      // Weather details comparison
      const detailsCard = document.createElement("div");
      detailsCard.classList.add("city-card");
      detailsCard.innerHTML = `
        <h3 class="city-name">${city.name}</h3>
        <div class="city-details-extended">
          <div class="detail-item">
            <span class="detail-label">Sunrise</span>
            <span class="detail-value">${new Date(city.weather.sys.sunrise * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Sunset</span>
            <span class="detail-value">${new Date(city.weather.sys.sunset * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Visibility</span>
            <span class="detail-value">${(city.weather.visibility / 1000).toFixed(1)} km</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Clouds</span>
            <span class="detail-value">${city.weather.clouds.all}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">UV Index</span>
            <span class="detail-value">N/A</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dew Point</span>
            <span class="detail-value">N/A</span>
          </div>
        </div>
      `;
      detailsComparison.appendChild(detailsCard);
    });

    // Add event listeners to favorite and remove buttons
    document.querySelectorAll(".card-btn.favorite").forEach((btn) => {
      btn.addEventListener("click", toggleFavorite);
    });
    document.querySelectorAll(".card-btn.remove").forEach((btn) => {
      btn.addEventListener("click", removeCity);
    });
  }

  // Group forecast data by day
  function groupForecastByDay(forecastList) {
    const dailyForecasts = {};
    forecastList.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          maxTemp: item.main.temp_max,
          minTemp: item.main.temp_min,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      } else {
        if (item.main.temp_max > dailyForecasts[date].maxTemp) {
          dailyForecasts[date].maxTemp = item.main.temp_max;
        }
        if (item.main.temp_min < dailyForecasts[date].minTemp) {
          dailyForecasts[date].minTemp = item.main.temp_min;
        }
      }
    });
    return dailyForecasts;
  }

  // Toggle favorite status for a city
  function toggleFavorite(e) {
    const cityId = Number.parseInt(e.currentTarget.getAttribute("data-id"));
    const cityIndex = cities.findIndex((city) => city.id === cityId);
    if (cityIndex !== -1) {
      cities[cityIndex].isFavorite = !cities[cityIndex].isFavorite;
      saveCities();
      renderCityCards();
    }
  }

  // Remove a city from comparison
  function removeCity(e) {
    const cityId = Number.parseInt(e.currentTarget.getAttribute("data-id"));
    cities = cities.filter((city) => city.id !== cityId);
    saveCities();
    renderCityCards();
    if (document.getElementById("charts-tab")?.classList.contains("active")) {
      setTimeout(() => {
        if (cities.length === 0 && chart) {
          chart.destroy();
          chart = null;
        } else {
          renderChart();
        }
      }, 100);
    }
  }

  // Load favorite cities for comparison
  function loadFavorites() {
    const favorites = localStorage.getItem("favoriteWeatherCities");
    if (!favorites) {
      alert("You don't have any favorite cities saved.");
      return;
    }
    const favoriteCities = JSON.parse(favorites);
    if (favoriteCities.length === 0) {
      alert("You don't have any favorite cities saved.");
      return;
    }
    cities = [];
    Promise.all(
      favoriteCities.map(async (cityName) => {
        try {
          const weatherData = await fetchWeatherData(cityName);
          const forecastData = await fetchForecastData(cityName);
          return {
            id: Date.now() + Math.random(),
            name: weatherData.name,
            country: weatherData.sys.country,
            weather: weatherData,
            forecast: forecastData,
            isFavorite: true,
          };
        } catch (error) {
          return null;
        }
      })
    ).then((results) => {
      cities = results.filter((city) => city !== null);
      saveCities();
      renderCityCards();
      if (document.getElementById("charts-tab")?.classList.contains("active")) {
        setTimeout(renderChart, 100);
      }
    });
  }

  // Clear all cities from comparison
  function clearAll() {
    if (cities.length === 0) return;
    if (confirm("Are you sure you want to clear all cities from comparison?")) {
      cities = [];
      saveCities();
      renderCityCards();
      if (document.getElementById("charts-tab")?.classList.contains("active") && chart) {
        chart.destroy();
        chart = null;
      }
    }
  }

  // Save cities to localStorage
  function saveCities() {
    localStorage.setItem("comparisonCities", JSON.stringify(cities));
  }

  // Render comparison chart
  function renderChart() {
    if (typeof Chart === "undefined") return;
    if (!comparisonChart) return;
    const chartType = chartTypeSelect ? chartTypeSelect.value : "temperature";
    if (cities.length === 0) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      return;
    }
    let labels = [];
    let datasets = [];
    switch (chartType) {
      case "temperature":
        labels = cities.map((city) => city.name);
        datasets = [
          {
            label: "Current Temperature (°C)",
            data: cities.map((city) => Math.round(city.weather.main.temp)),
            backgroundColor: "rgba(52, 152, 219, 0.7)",
            borderColor: "rgba(52, 152, 219, 1)",
            borderWidth: 1,
          },
          {
            label: "Feels Like (°C)",
            data: cities.map((city) => Math.round(city.weather.main.feels_like)),
            backgroundColor: "rgba(46, 204, 113, 0.7)",
            borderColor: "rgba(46, 204, 113, 1)",
            borderWidth: 1,
          },
        ];
        break;
      case "humidity":
        labels = cities.map((city) => city.name);
        datasets = [
          {
            label: "Humidity (%)",
            data: cities.map((city) => city.weather.main.humidity),
            backgroundColor: "rgba(155, 89, 182, 0.7)",
            borderColor: "rgba(155, 89, 182, 1)",
            borderWidth: 1,
          },
        ];
        break;
      case "wind":
        labels = cities.map((city) => city.name);
        datasets = [
          {
            label: "Wind Speed (km/h)",
            data: cities.map((city) => city.weather.wind.speed),
            backgroundColor: "rgba(241, 196, 15, 0.7)",
            borderColor: "rgba(241, 196, 15, 1)",
            borderWidth: 1,
          },
        ];
        break;
      case "pressure":
        labels = cities.map((city) => city.name);
        datasets = [
          {
            label: "Pressure (hPa)",
            data: cities.map((city) => city.weather.main.pressure),
            backgroundColor: "rgba(231, 76, 60, 0.7)",
            borderColor: "rgba(231, 76, 60, 1)",
            borderWidth: 1,
          },
        ];
        break;
    }
    if (chart) {
      chart.destroy();
      chart = null;
    }
    chart = new Chart(comparisonChart, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
          x: {
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
        },
        plugins: {
          legend: {
            labels: { color: "rgba(255, 255, 255, 0.7)" },
          },
        },
      },
    });
  }

  // Initialize the page
  init();
});
