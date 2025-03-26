import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './WebSearch.css';

const WebSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState('all'); // 'all' | 'images' | 'videos' | 'news'
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      // DuckDuckGo Instant Answer API
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
      const data = await res.json();
      // Flatten nested topics
      let relTopics = data.RelatedTopics || [];
      const flattenResults = (topics) => {
        let flat = [];
        topics.forEach(item => {
          if (item.Topics) {
            flat = flat.concat(flattenResults(item.Topics));
          } else {
            flat.push(item);
          }
        });
        return flat;
      };
      const flat = flattenResults(relTopics);
      setResults(flat);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter for items that have an image icon
  const imageResults = results.filter(item => item.Icon && item.Icon.URL);

  // Currently, DuckDuckGo doesn't provide distinct "videos" or "news" data
  // We'll just re-use text results for demonstration
  const videoResults = results; // placeholder
  const newsResults = results;  // placeholder

  return (
    <div className="websearch-page">
      {/* Header with Google icon and search bar */}
      <div className="websearch-header">
        <div className="google-icon">
          <img src="/google-icon.png" alt="Google" />
        </div>
        <div className="header-search">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Google or type a URL"
            />
          </div>
          <button onClick={handleSearch} className="search-btn">Search</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="websearch-tabs">
        <button
          className={mode === 'all' ? 'active' : ''}
          onClick={() => setMode('all')}
        >
          All
        </button>
        <button
          className={mode === 'images' ? 'active' : ''}
          onClick={() => setMode('images')}
        >
          Images
        </button>
        <button
          className={mode === 'videos' ? 'active' : ''}
          onClick={() => setMode('videos')}
        >
          Videos
        </button>
        <button
          className={mode === 'news' ? 'active' : ''}
          onClick={() => setMode('news')}
        >
          News
        </button>
      </div>

      {/* Results area */}
      <div className="websearch-results">
        {loading && <p>Loading...</p>}

        {!loading && mode === 'all' && (
          <div className="result-list">
            {results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              results.map((item, idx) => (
                <div key={idx} className="result-item">
                  <a href={item.FirstURL} target="_blank" rel="noopener noreferrer">
                    <h4>{item.Text}</h4>
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && mode === 'images' && (
          <div className="image-grid">
            {imageResults.length === 0 ? (
              <p>No images found.</p>
            ) : (
              imageResults.map((item, idx) => {
                // Some icons might be relative paths like "/i/duckduckgo.com.ico"
                // We'll prefix with https://duckduckgo.com if needed
                let iconUrl = item.Icon.URL;
                if (!iconUrl.startsWith('http')) {
                  iconUrl = `https://duckduckgo.com${iconUrl}`;
                }
                return (
                  <div key={idx} className="image-item">
                    <a href={item.FirstURL} target="_blank" rel="noopener noreferrer">
                      <img src={iconUrl} alt={item.Text} />
                    </a>
                    <p>{item.Text}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {!loading && mode === 'videos' && (
          <div className="result-list">
            {videoResults.length === 0 ? (
              <p>No videos found.</p>
            ) : (
              videoResults.map((item, idx) => (
                <div key={idx} className="result-item">
                  <a href={item.FirstURL} target="_blank" rel="noopener noreferrer">
                    <h4>{item.Text}</h4>
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && mode === 'news' && (
          <div className="result-list">
            {newsResults.length === 0 ? (
              <p>No news found.</p>
            ) : (
              newsResults.map((item, idx) => (
                <div key={idx} className="result-item">
                  <a href={item.FirstURL} target="_blank" rel="noopener noreferrer">
                    <h4>{item.Text}</h4>
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSearch;
