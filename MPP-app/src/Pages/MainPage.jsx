import React, { useRef, useCallback, useEffect, useState } from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";
import '../Components/SortButton/SortButton.css'
import './MainPage.css'
import '../Components/Pagination/Pagination.css'
import useGetBooks from "../Hooks/useGetBooks";
import axios from 'axios'
import { useAuth } from "../utils/AuthContext";

import { clearBooks, getAllOperations, getAllBooks } from "../utils/offlineStorage";
import useConnectivityStatus from "../Hooks/useConnectivityStatus";

function MainPage(props) {
  const { isOfflineMode } = props;
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [paginationIndex, setPaginationIndex] = useState(0);
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({ author: '', title: '' });

  // Load books initially and when pagination changesz
  useEffect(() => {
    if (isOfflineMode) {
      const fetchOfflineBooks = async () => {
        const offlineBooks = await getAllBooks();
        setBooks(offlineBooks);
      };
      fetchOfflineBooks();
    } else {
      fetchBooks();
    }
  }, [isOfflineMode, paginationIndex]);

  // Get total book count for pagination
  useEffect(() => {
    if (!isOfflineMode) {
      axios.get('http://localhost:8800/books/count')
        .then(res => {
          setTotalBooks(res.data.total);
        })
        .catch(err => {
          console.log('Error fetching book count:', err);
        });
    }
  }, [isOfflineMode]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // If user is admin and wants to see all books
      const endpoint = isAdmin && document.getElementById('showAllBooks')?.checked
        ? 'http://localhost:8800/books'
        : `http://localhost:8800/books/page/${paginationIndex}`;

      const res = await axios.get(endpoint);
      setBooks(res.data);
    } catch (err) {
      console.log('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineData = async () => {
    if (isOfflineMode) return;
    
    const offlineBooks = await getAllBooks();
    if (offlineBooks.length > 0) {
      for (const book of offlineBooks) {
        try {
          await axios.post("http://localhost:8800/books", book);
        } catch (err) {
          console.log("Error syncing offline book:", err);
        }
      }
      // Refresh books after sync
      fetchBooks();
      // Clear offline storage after successful sync
      clearBooks();
    }
  };

  // Call sync when coming back online
  useEffect(() => {
    if (!isOfflineMode) {
      syncOfflineData();
    }
  }, [isOfflineMode]);

  const nextPage = () => {
    const maxPages = Math.ceil(totalBooks / pageSize);
    if (paginationIndex < maxPages - 1) {
      setPaginationIndex(paginationIndex + 1);
    }
  };

  const prevPage = () => {
    if (paginationIndex > 0) {
      setPaginationIndex(paginationIndex - 1);
    }
  };

  const handleSearch = async () => {
    const { author, title } = searchParams;
    
    if (isOfflineMode) {
      const offlineBooks = await getAllBooks();
      if (offlineBooks.length > 0) {
        const filteredBooks = offlineBooks.filter((book) => {
          const matchesTitle = !title || book.title.toLowerCase().includes(title.toLowerCase());
          const matchesAuthor = !author || book.author.toLowerCase().includes(author.toLowerCase());
          return matchesTitle && matchesAuthor;
        });
        setBooks(filteredBooks);
      }
      return;
    }
    
    // If both author and title are empty, fetch all books
    if (!author && !title) {
      fetchBooks();
      return;
    }
    
    try {
      let endpoint;
      
      if (author && title) {
        // Both author and title
        endpoint = `http://localhost:8800/books/search/${title}/author/${author}`;
      } else if (author) {
        // Only author
        endpoint = `http://localhost:8800/books/author/${author}`;
      } else {
        // Only title
        endpoint = `http://localhost:8800/books/search/${title}`;
      }
      
      const res = await axios.get(endpoint);
      setBooks(res.data);
    } catch (err) {
      console.log('Error searching books:', err);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [id === 'author' ? 'author' : 'title']: value
    }));
  };

  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = async () => {
    // Toggle sort direction
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);

    if (isOfflineMode) {
      const offlineBooks = await getAllBooks();
      if (offlineBooks.length > 0) {
        const sortedBooks = [...offlineBooks].sort((a, b) => {
          return newDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        });
        setBooks(sortedBooks);
      }
      return;
    }

    try {
      const url = newDirection === 'asc'
        ? `http://localhost:8800/books/page/${paginationIndex}/sort`
        : `http://localhost:8800/books/page/${paginationIndex}/sort/reverse`;
      
      const res = await axios.get(url);
      setBooks(res.data);
    } catch (err) {
      console.log('Error sorting books:', err);
    }
  };

  const handleShowAllBooks = () => {
    // Refresh books when the admin toggles "Show All Books"
    fetchBooks();
  };

  return (
    <>
      <div>
        <Title title="OnlyBooks" />
        {/* <Navbar /> */}
        <AddButton />
        
        <div className="filters-container">
          <div className="sort-button">
            <button onClick={handleSort}>
              Sort by rating {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="filter-section">
            <input 
              type="text" 
              placeholder="Filter by author" 
              id="author" 
              value={searchParams.author}
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              placeholder="Search by title" 
              id="search" 
              value={searchParams.title}
              onChange={handleInputChange} 
            />
            <button 
              className="search-button" 
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          
          {/* Admin option to show all books */}
          {isAdmin && (
            <div className="admin-options">
              <label>
                <input 
                  type="checkbox" 
                  id="showAllBooks" 
                  onChange={handleShowAllBooks}
                />
                Show All Books
              </label>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="no-books">No books found</div>
        ) : (
          <div className="book-container">
            {books.map((book, index) => (
              <Card key={book.id || index} book={book} isOfflineMode={isOfflineMode} />
            ))}
          </div>
        )}
        
        {/* Only show pagination if not showing all books */}
        {!isAdmin || !document.getElementById('showAllBooks')?.checked ? (
          <div className="pagination">
            <button onClick={prevPage} disabled={paginationIndex === 0}>
              &laquo; Previous
            </button>
            <span className="page-indicator">
              Page {paginationIndex + 1} / {Math.ceil(totalBooks / pageSize) || 1}
            </span>
            <button onClick={nextPage} disabled={paginationIndex >= Math.ceil(totalBooks / pageSize) - 1}>
              Next &raquo;
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default MainPage;