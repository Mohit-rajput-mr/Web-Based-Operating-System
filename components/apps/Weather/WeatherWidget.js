import React, { useEffect, useState } from "react";
import "./WeatherWidget.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

const API_KEY = "f298a52afd3c4e6fac552739251703";

export default function WeatherWidget() {
  const [cityName, setCityName] = useState("New York");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeather(cityName);
  }, []);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
          city
        )}&days=7&aqi=no&alerts=no`
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      setWeatherData(data.current);
      setForecastData(data.forecast.forecastday || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!cityName.trim()) return;
    fetchWeather(cityName.trim());
  };

  let chartData = null;
  if (forecastData.length > 0) {
    const labels = forecastData.map((day) =>
      new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })
    );
    const temps = forecastData.map((day) => day.day.avgtemp_c);
    chartData = {
      labels,
      datasets: [
        {
          label: "Avg Temp (°C)",
          data: temps,
          fill: false,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#fff",
        },
      ],
    };
  }

  return (
    <div className="weather-widget-container">
      <div className="weather-bg" />
      <div className="glass-panel">
        <div className="top-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for a city..."
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {loading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="middle-section">
          <div className="left-box">
            {weatherData && (
              <div className="left-box-content">
                <img src={weatherData.condition.icon} alt="weather" />
                <h1>{Math.round(weatherData.temp_c)}°C</h1>
                <p className="description">{weatherData.condition.text}</p>
                <div className="stats">
                  <p>Feels like: {Math.round(weatherData.feelslike_c)}°C</p>
                  <p>Humidity: {weatherData.humidity}%</p>
                  <p>Wind: {Math.round(weatherData.wind_kph)} km/h</p>
                  <p>Pressure: {weatherData.pressure_mb} hPa</p>
                </div>
              </div>
            )}
          </div>
          <div className="right-box">
            {chartData && (
              <div className="right-box-content">
                <h2>Daily Temperature Chart</h2>
                <div className="chart-wrapper">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          ticks: { color: "#fff" },
                          grid: { color: "rgba(255,255,255,0.2)" },
                        },
                        y: {
                          ticks: { color: "#fff" },
                          grid: { color: "rgba(255,255,255,0.2)" },
                        },
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0,0,0,0.7)",
                          titleColor: "#fff",
                          bodyColor: "#fff",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bottom-section">
          {forecastData.length > 0 && (
            <>
              <h2>7-Day Forecast</h2>
              <div className="forecast-cards">
                {forecastData.map((day, i) => (
                  <div key={i} className="forecast-card">
                    <p className="forecast-date">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <img src={day.day.condition.icon} alt="weather" />
                    <p className="forecast-temp">{Math.round(day.day.avgtemp_c)}°C</p>
                    <p className="forecast-desc">{day.day.condition.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
