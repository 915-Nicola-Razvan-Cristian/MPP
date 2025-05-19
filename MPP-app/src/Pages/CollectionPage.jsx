import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import './CollectionPage.css';

const CollectionPage = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user's book collection
    fetchCollection();
  }, [isAuthenticated, navigate]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8800/users/books');
      setCollection(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load your book collection. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCollection = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book from your collection?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8800/users/books/${bookId}`);
      // Update collection state
      setCollection(collection.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error removing book from collection:', err);
      alert('Failed to remove book from collection. Please try again.');
    }
  };

  if (loading) {
    return <div className="collection-loading">Loading your collection...</div>;
  }

  return (
    <div className="collection-container">
      <h1>My Book Collection</h1>
      
      {error && <div className="collection-error">{error}</div>}
      
      {collection.length === 0 ? (
        <div className="collection-empty">
          <p>Your collection is empty.</p>
          <button className="browse-books-btn" onClick={() => navigate('/')}>
            Browse Books
          </button>
        </div>
      ) : (
        <div className="collection-grid">
          {collection.map(book => (
            <div key={book.id} className="collection-book-card">
              <div className="collection-book-cover">
                <img src={book.cover || '/placeholder-cover.jpg'} alt={book.title} />
              </div>
              <div className="collection-book-info">
                <h3>{book.title}</h3>
                <p className="collection-book-author">by {book.author}</p>
                <p className="collection-book-genres">{book.genres}</p>
                <div className="collection-book-rating">
                  Rating: {book.rating}/10
                </div>
                <p className="collection-book-added">
                  Added on: {new Date(book.added_at).toLocaleDateString()}
                </p>
                <div className="collection-book-actions">
                  <button
                    className="collection-view-btn"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="collection-remove-btn"
                    onClick={() => removeFromCollection(book.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage; 