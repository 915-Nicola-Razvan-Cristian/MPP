import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

import AuthorCard from "../Components/AuthorCard/AuthorCard";
import Navbar from "../Components/Navbar/Navbar";
import "./Authors.css";

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, [update]);

  // Fetch authors based on search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchAuthors(searchTerm);
      } else if (searchTerm.length === 0) {
        fetchAuthors();
      }
    }, 300); // Debounce search to avoid too many requests

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8800/authors");
      setAuthors(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const searchAuthors = async (term) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8800/authors/search/${term}`);
      setAuthors(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name) {
      alert("Please enter the author name!");
      return;
    }

    try {
      await axios.post("http://localhost:8800/authors", { name });
      alert("Author added successfully!");
      setUpdate(!update);
      setName("");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="authors-page">
      {/* <Navbar /> */}
      <div className="authors-container">
        <h1>Authors</h1>
        
        <div className="authors-controls">
          <div className="add-author-section">
            <input
              type="text"
              placeholder="Author Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="author-input"
            />
            <button
              onClick={handleAdd}
              className="add-author-button"
            >
              Add Author
            </button>
          </div>
          
          <div className="search-section">
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading authors...</div>
        ) : authors.length === 0 ? (
          <div className="no-results">
            {searchTerm ? `No authors found matching "${searchTerm}"` : "No authors found"}
          </div>
        ) : (
          <div className="authors-list">
            {authors.map((author) => (
              <div key={author.id} className="author-item" onClick={() => setSelectedAuthor(author)}>
                <AuthorCard author={author} isOfflineMode={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}