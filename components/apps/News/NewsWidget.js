import React, { useEffect, useState } from 'react';
import './NewsWidget.css';

const NewsWidget = () => {
  const [articles, setArticles] = useState([]);
  const [country, setCountry] = useState('us');
  const [category, setCategory] = useState('general');
  const apiKey = '84106d4e8837428db5b2bc3bafe328c9';

  const fetchNews = () => {
    fetch(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`)
      .then(res => res.json())
      .then(data => setArticles(data.articles || []))
      .catch(err => console.error("Error fetching news:", err));
  };

  useEffect(() => {
    fetchNews();
  }, [country, category]);

  const handleSearch = () => {
    if (country.trim() !== '') fetchNews();
  };

  const heroArticle = articles[0];
  const gridArticles = articles.slice(1, 5);

  return (
    <div className="news-widget">
      {/* Header */}
      <div className="news-header">
        <div className="news-header-left">
          <h2>Good morning</h2>
        </div>
        <div className="news-search">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter country code (e.g. us, in, gb)"
          />
          <button onClick={handleSearch}>Refresh</button>
        </div>
      </div>

      {/* Navigation */}
      <div className="news-nav">
        <button onClick={() => setCategory('general')}>Discover</button>
        <button onClick={() => setCategory('business')}>Following</button>
        <button onClick={() => setCategory('entertainment')}>Watch</button>
        <button onClick={() => setCategory('gaming')}>Gaming</button>
        <button onClick={() => setCategory('science')}>For you</button>
        <button onClick={() => setCategory('technology')}>Trending</button>
      </div>

      {/* Hero Article */}
      {heroArticle && (
        <div className="news-hero">
          {heroArticle.urlToImage && (
            <img src={heroArticle.urlToImage} alt="News Hero" />
          )}
          <div className="news-hero-title">
            <a href={heroArticle.url} target="_blank" rel="noopener noreferrer">
              {heroArticle.title}
            </a>
          </div>
          <div className="news-hero-source">
            {heroArticle.source?.name}
          </div>
        </div>
      )}

      {/* Grid Articles */}
      <div className="news-grid">
        {gridArticles.map((article, i) => (
          <div className="news-item" key={i}>
            {article.urlToImage && (
              <img src={article.urlToImage} alt="News" />
            )}
            <div className="news-item-content">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
              <div className="news-item-source">
                {article.source?.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
