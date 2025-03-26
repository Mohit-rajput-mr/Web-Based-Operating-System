import React, { useState, useEffect } from 'react';
import './DictionaryLookup.css';

const DictionaryLookup = () => {
  const [query, setQuery] = useState('');
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load favorites and history from localStorage
  useEffect(() => {
    const favs = localStorage.getItem('favorites');
    const hist = localStorage.getItem('history');
    if (favs) setFavorites(JSON.parse(favs));
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  // Fetch word data from the free dictionary API
  const fetchWordData = async (word) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error("Word not found");
      }
      const data = await response.json();
      setWordData(data[0]);
      setHistory(prev => {
        const newHistory = [word, ...prev.filter(item => item !== word)];
        return newHistory.slice(0, 10); // keep only latest 10 items
      });
    } catch (err) {
      setError(err.message);
      setWordData(null);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      fetchWordData(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setWordData(null);
    setError('');
  };

  const handleRandom = async () => {
    setLoading(true);
    try {
      // Using random-word-api for a random word
      const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
      const data = await response.json();
      const randomWord = data[0];
      setQuery(randomWord);
      fetchWordData(randomWord);
    } catch (err) {
      setError("Error fetching random word");
    }
    setLoading(false);
  };

  const handleAddFavorite = () => {
    if (wordData && !favorites.includes(wordData.word)) {
      setFavorites([...favorites, wordData.word]);
    }
  };

  const handleRemoveFavorite = (word) => {
    setFavorites(favorites.filter(item => item !== word));
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleCopyDefinition = (definitionText) => {
    navigator.clipboard.writeText(definitionText)
      .then(() => alert("Definition copied to clipboard"))
      .catch(() => alert("Failed to copy"));
  };

  const handleSynonymClick = (synonym) => {
    setQuery(synonym);
    fetchWordData(synonym);
  };

  const handleShare = () => {
    if (navigator.share && wordData) {
      navigator.share({
        title: `Definition of ${wordData.word}`,
        text: `Check out the definition of ${wordData.word}!`,
        url: window.location.href
      }).catch(err => console.error("Error sharing", err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("URL copied to clipboard"))
        .catch(() => alert("Failed to copy URL"));
    }
  };

  return (
    <div className={`dictionary-lookup ${theme}`}>
      <div className="dl-container">
        <div className="dl-header">
          <h1>Dictionary Lookup</h1>
          <button onClick={handleThemeToggle} className="theme-toggle">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
        <form onSubmit={handleSearch} className="dl-form">
          <input
            type="text"
            placeholder="Enter a word..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="dl-buttons">
            <button type="submit">Search</button>
            <button type="button" onClick={handleClear}>Clear</button>
            <button type="button" onClick={handleRandom}>Random Word</button>
          </div>
        </form>
        {loading && <div className="dl-loading">Loading...</div>}
        {error && <div className="dl-error">{error}</div>}
        {wordData && (
          <div className="dl-result">
            <div className="dl-word-header">
              <h2>{wordData.word}</h2>
              {wordData.phonetics && wordData.phonetics.length > 0 && (
                <div className="dl-phonetics">
                  {wordData.phonetics[0].text}
                  {wordData.phonetics[0].audio && (
                    <audio controls src={wordData.phonetics[0].audio}>
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              )}
              <div className="dl-actions">
                <button onClick={handleAddFavorite}>Add to Favorites</button>
                <button onClick={handleShare}>Share</button>
              </div>
            </div>
            {wordData.meanings && wordData.meanings.map((meaning, index) => (
              <div key={index} className="dl-meaning">
                <h3>{meaning.partOfSpeech}</h3>
                {meaning.definitions && meaning.definitions.map((def, i) => (
                  <div key={i} className="dl-definition">
                    <p className="definition-text">{def.definition}</p>
                    {def.example && <p className="definition-example">Example: {def.example}</p>}
                    {def.synonyms && def.synonyms.length > 0 && (
                      <p className="definition-synonyms">
                        Synonyms: {def.synonyms.map((syn, idx) => (
                          <span key={idx} className="synonym" onClick={() => handleSynonymClick(syn)}>
                            {syn}{idx !== def.synonyms.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                    {def.antonyms && def.antonyms.length > 0 && (
                      <p className="definition-antonyms">
                        Antonyms: {def.antonyms.join(', ')}
                      </p>
                    )}
                    <div className="definition-buttons">
                      <button onClick={() => handleCopyDefinition(def.definition)}>Copy Definition</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="dl-toggle-advanced">
              <button onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Hide Advanced Details' : 'Show Advanced Details'}
              </button>
            </div>
            {showAdvanced && wordData.origin && (
              <div className="dl-advanced">
                <h3>Origin</h3>
                <p>{wordData.origin}</p>
              </div>
            )}
          </div>
        )}
        <div className="dl-history-favorites">
          <div className="dl-history">
            <h3>Search History</h3>
            <ul>
              {history.map((word, idx) => (
                <li key={idx} onClick={() => { setQuery(word); fetchWordData(word); }}>{word}</li>
              ))}
            </ul>
          </div>
          <div className="dl-favorites">
            <h3>Favorites</h3>
            <ul>
              {favorites.map((word, idx) => (
                <li key={idx}>
                  <span onClick={() => { setQuery(word); fetchWordData(word); }}>{word}</span>
                  <button onClick={() => handleRemoveFavorite(word)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryLookup;
