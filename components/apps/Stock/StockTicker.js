import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './StockTicker.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockTicker = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage if available
    const saved = localStorage.getItem('stockFavorites');
    return saved ? JSON.parse(saved) : ['AAPL', 'MSFT', 'GOOGL'];
  });
  const [timeRange, setTimeRange] = useState('5days'); // Options: 5days, 1month, 3months, 1year
  const apiKey = 'IFTEI3OXILFEYRS3'; // Your Alpha Vantage API key
  const intervalRef = useRef(null);

  // Fetch stock data (current stock quote)
  const fetchStock = (sym) => {
    setLoading(true);
    setError(null); // Reset error state on new fetch
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
          setStockData(data['Global Quote']);
          setLoading(false);
        } else if (data.Note) {
          // API limit reached
          setError('API call frequency limit reached. Please try again later.');
          setLoading(false);
        } else {
          setError('Stock data not found. Please check the symbol.');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to fetch stock data. Check your internet connection.');
        setLoading(false);
      });
  };

  // Fetch historical stock data
  const fetchHistoricalData = (sym) => {
    const functionType = 'TIME_SERIES_DAILY';
    
    fetch(`https://www.alphavantage.co/query?function=${functionType}&symbol=${sym}&apikey=${apiKey}&outputsize=full`)
      .then(res => res.json())
      .then(data => {
        if (data['Time Series (Daily)']) {
          const timeSeries = data['Time Series (Daily)'];
          let dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
          
          // Limit data based on selected time range
          if (timeRange === '5days') {
            dates = dates.slice(0, 5);
          } else if (timeRange === '1month') {
            dates = dates.slice(0, 21); // Approx. 21 trading days in a month
          } else if (timeRange === '3months') {
            dates = dates.slice(0, 63); // Approx. 63 trading days in 3 months
          } // Else use all data for 1year
          
          // Reverse for chronological order
          dates = dates.reverse();
          
          const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
          const formattedDates = dates.map(date => {
            const d = new Date(date);
            return `${d.getMonth()+1}/${d.getDate()}`;
          });
          
          setHistoricalData({ 
            dates: formattedDates, 
            prices,
            high: prices.reduce((max, p) => p > max ? p : max, 0),
            low: prices.reduce((min, p) => p < min ? p : min, Infinity)
          });
        } else if (data.Note) {
          setError('API call frequency limit reached. Please try again later.');
        } else {
          setError('Failed to fetch historical data.');
        }
      })
      .catch(() => {
        setError('Failed to fetch historical data.');
      });
  };

  useEffect(() => {
    fetchStock(symbol);
    fetchHistoricalData(symbol);
    
    // Set auto-refresh interval
    intervalRef.current = setInterval(() => {
      fetchStock(symbol);
    }, 60000); // Update stock data every minute

    return () => clearInterval(intervalRef.current);
  }, [symbol, timeRange]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stockFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = () => {
    if (symbol.trim() !== '') {
      fetchStock(symbol);
      fetchHistoricalData(symbol);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const addToFavorites = () => {
    if (symbol && !favorites.includes(symbol)) {
      setFavorites([...favorites, symbol]);
    }
  };

  const removeFromFavorites = (sym) => {
    setFavorites(favorites.filter(s => s !== sym));
  };

  const selectFavorite = (sym) => {
    setSymbol(sym);
    fetchStock(sym);
    fetchHistoricalData(sym);
  };

  const chartData = {
    labels: historicalData ? historicalData.dates : [],
    datasets: [
      {
        label: `${symbol} Stock Price`,
        data: historicalData ? historicalData.prices : [],
        fill: false,
        borderColor: theme === 'light' ? '#3a72ff' : '#5ce1e6',
        backgroundColor: theme === 'light' ? 'rgba(58, 114, 255, 0.2)' : 'rgba(92, 225, 230, 0.2)',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: theme === 'light' ? '#333' : '#f5f5f5'
        }
      },
      x: {
        grid: {
          color: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: theme === 'light' ? '#333' : '#f5f5f5'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'light' ? '#333' : '#f5f5f5'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };

  if (loading && !stockData && !historicalData) {
    return (
      <div className={`stock-ticker-container ${theme}`}>
        <div className="st-loading">
          <div className="st-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  const priceChange = stockData ? parseFloat(stockData['09. change']) : 0;
  const priceChangeClass = priceChange > 0 ? 'positive' : priceChange < 0 ? 'negative' : '';

  return (
    <div className={`stock-ticker-container ${theme}`}>
      <div className="st-header">
        <h2>Stock Market</h2>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      <div className="st-search">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g. AAPL)"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <div className="st-error">{error}</div>}

      <div className="st-info">
        <div className="st-stock">
          {stockData ? (
            <>
              <h3>{symbol}</h3>
              <p>Price: <strong>${parseFloat(stockData['05. price']).toFixed(2)}</strong></p>
              <p className={priceChangeClass}>
                Change: {stockData['09. change']} ({stockData['10. change percent']})
              </p>
              <p>Volume: {parseInt(stockData['06. volume']).toLocaleString()}</p>
              <p>Last Trading Day: {stockData['07. latest trading day']}</p>
            </>
          ) : !loading && (
            <p>No stock data available.</p>
          )}
        </div>

        <div className="st-actions">
          <button onClick={addToFavorites} disabled={favorites.includes(symbol)}>
            {favorites.includes(symbol) ? 'Added to Favorites' : 'Add to Favorites'}
          </button>
          <button onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank')}>
            View Details
          </button>
        </div>
      </div>

      <div className="st-favorites">
        <h4>Favorite Stocks</h4>
        {favorites.length > 0 ? (
          <ul>
            {favorites.map(fav => (
              <li key={fav}>
                <span onClick={() => selectFavorite(fav)}>{fav}</span>
                <button onClick={() => removeFromFavorites(fav)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No favorites added yet</p>
        )}
      </div>

      <div className="st-chart-controls">
        <label htmlFor="timeRange">Time Range:</label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="5days">5 Days</option>
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="1year">1 Year</option>
        </select>

        {historicalData && (
          <div className="st-minmax">
            <span>High: ${historicalData.high.toFixed(2)}</span>
            <span>Low: ${historicalData.low.toFixed(2)}</span>
          </div>
        )}
      </div>

      {historicalData && (
        <div className="st-chart">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="st-news-ticker">
        Data provided by Alpha Vantage — Stock market data is delayed by at least 15 minutes
      </div>
    </div>
  );
};

export default StockTicker;