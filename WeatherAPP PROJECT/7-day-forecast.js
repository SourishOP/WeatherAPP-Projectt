const forecastContainer = document.getElementById("forecast-container")
const apiKey = "19eb282dbdaa3815c081dbcbcc0af5da"
const city = localStorage.getItem("city")

async function fetch7DayForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.cod !== "200") {
      forecastContainer.innerHTML = `<h2>Failed to fetch data. Try again later.</h2>`
      return
    }

    displayForecast(data)
  } catch (error) {
    forecastContainer.innerHTML = `<h2>Error fetching forecast.</h2>`
  }
}

function displayForecast(data) {
  const dailyData = {}

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0]

    if (!dailyData[date]) {
      dailyData[date] = item
    }
  })

  forecastContainer.innerHTML = ""

  Object.keys(dailyData)
    .slice(0, 7)
    .forEach((date, index) => {
      const dayData = dailyData[date]
      const weather = dayData.weather[0]
      const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`

      const forecastCard = document.createElement("div")
      forecastCard.classList.add("forecast-section")
      forecastCard.dataset.index = index

      forecastCard.innerHTML = `
            <div class="header">
                <span class="date">${new Date(date).toDateString()}</span>
                <img src="${iconUrl}" alt="${weather.description}" class="weather-icon"/>
            </div>
            <div class="forecast-content">
                <p><strong>Temperature:</strong> ${dayData.main.temp}°C</p>
                <p><strong>Humidity:</strong> ${dayData.main.humidity}%</p>
                <p><strong>Wind Speed:</strong> ${dayData.wind.speed} Km/H</p>
                <p><strong>Description:</strong> ${weather.description}</p>
            </div>
        `

      forecastCard.addEventListener("mouseenter", () => {
        if (!forecastCard.classList.contains("expanded")) {
          forecastCard.style.boxShadow = "0 6px 12px rgba(255, 255, 255, 0.2)"
        }
      })

      forecastCard.addEventListener("mouseleave", () => {
        if (!forecastCard.classList.contains("expanded")) {
          forecastCard.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)"
        }
      })

      forecastCard.addEventListener("click", () => {
        document.querySelectorAll(".forecast-section").forEach((sec) => {
          if (sec !== forecastCard) {
            sec.classList.remove("expanded")
            sec.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)"
          }
        })

        if (!forecastCard.classList.contains("expanded")) {
          forecastCard.classList.add("expanded")
          forecastCard.style.boxShadow = "0 6px 10px rgba(255, 255, 255, 0.3)"
        } else {
          forecastCard.classList.remove("expanded")
          forecastCard.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)"
        }
      })

      forecastContainer.appendChild(forecastCard)
    })
}

fetch7DayForecast()
