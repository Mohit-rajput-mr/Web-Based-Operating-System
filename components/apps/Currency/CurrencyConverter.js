import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './CurrencyConverter.css';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// List of currencies (you can extend this list as needed)
const currencies = [
  "USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "MXN", "BRL", "ZAR", "SGD", "NZD", "KRW", "RUB", "TRY", "SAR", "PKR"
];

const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  // API Keys
  const CURRENCY_API_KEY = 'cur_live_pgGCCCOkO0spkzEiB3sYChJCTpp5sBNjxswMqRZB'; // Currency API Key
  const EXCHANGE_RATE_HOST_KEY = '09b650c119f0151efb0d0313539746d3'; // ExchangeRate.Host API Key (not required)

  // Fetch available currencies from Currency API
  const fetchAvailableCurrencies = async () => {
    try {
      const url = `https://api.currencyapi.com/v3/currencies?apikey=${CURRENCY_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvailableCurrencies(Object.keys(data.data));
    } catch (error) {
      console.error("Error fetching available currencies:", error);
    }
  };

  // Convert currency using currencyapi.com API
  const convertCurrency = async () => {
    try {
      const url = `https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&base_currency=${fromCurrency}&currencies=${toCurrency}`;
      const response = await fetch(url);
      const data = await response.json();
      const rate = data.data[toCurrency].value;
      if (rate) {
        setResult((amount * rate).toFixed(4));
      }
    } catch (error) {
      console.error("Conversion error:", error);
    }
  };

  // Fetch historical data for the past 7 days using exchangerate.host
  const fetchHistoricalData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const formatDate = (date) => date.toISOString().split('T')[0];
      const start_str = formatDate(startDate);
      const end_str = formatDate(endDate);

      const url = `https://api.exchangerate.host/timeseries?start_date=${start_str}&end_date=${end_str}&base=${fromCurrency}&symbols=${toCurrency}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.rates) {
        const dates = Object.keys(data.rates).sort();
        const rates = dates.map(date => data.rates[date][toCurrency]);
        setHistoricalData({ dates, rates });
      }
    } catch (error) {
      console.error("Historical data error:", error);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    await convertCurrency();
    await fetchHistoricalData();
  };

  // Prepare data for the chart
  const chartData = {
    labels: historicalData ? historicalData.dates : [],
    datasets: [
      {
        label: `Exchange Rate (${fromCurrency} → ${toCurrency})`,
        data: historicalData ? historicalData.rates : [],
        fill: false,
        borderColor: '#3a72ff',
        tension: 0.1
      }
    ]
  };

  useEffect(() => {
    fetchAvailableCurrencies();
  }, []);

  return (
    <div className="currency-converter">
      <div className="cc-container">
        <h2>Currency Converter</h2>
        <form onSubmit={handleConvert} className="cc-form">
          <div className="cc-input-group">
            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
            />
          </div>
          <div className="cc-input-group">
            <label>From:</label>
            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
              {availableCurrencies.length > 0 && availableCurrencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <div className="cc-input-group">
            <label>To:</label>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
              {availableCurrencies.length > 0 && availableCurrencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <button type="submit">Convert</button>
        </form>
        {result && (
          <div className="cc-result">
            <h3>{amount} {fromCurrency} = {result} {toCurrency}</h3>
          </div>
        )}
        {historicalData && historicalData.dates.length > 0 && historicalData.rates.length > 0 && (
          <div className="cc-chart">
            <Line data={chartData} height={300} options={{ maintainAspectRatio: false }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
