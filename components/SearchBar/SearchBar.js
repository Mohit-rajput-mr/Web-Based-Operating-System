import React, { useState } from "react";
import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";
export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const handleSearch = () => onSearch(query);
  return (
    <div className="searchbar-container">
      <FaSearch className="searchbar-icon" />
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
