import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import multer from 'multer'

import { Server } from 'socket.io'
import { createServer } from 'http'
import { title } from 'process'
import { start } from 'repl'

// Import our new modules
import authRoutes from './auth.js'
import { authenticate, authorize, logAction, errorHandler } from './middleware.js'
import { startMonitoringService, getMonitoredUsers, updateMonitoredStatus, deleteResolvedLogs, simulateActivity } from './monitoring.js'

const app = express()

// Set up CORS early to apply to all routes
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Create HTTP server with CORS-enabled Express app
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
})

// Add database indices for performance optimization
const createIndices = () => {
  console.log('Checking and creating database indices for performance optimization...');
  
  // Index for books.author to optimize joins
  db.query('CREATE INDEX idx_books_author ON books(author)', (err) => {
    if (err) {
      // Index might already exist, which is fine
      console.error('Error creating author index:', err.message);
    } else {
      console.log('Author index created successfully');
    }
  });
  
  // Index for books.rating to optimize sorting and filtering
  db.query('CREATE INDEX idx_books_rating ON books(rating)', (err) => {
    if (err) {
      console.error('Error creating rating index:', err.message);
    } else {
      console.log('Rating index created successfully');
    }
  });
  
  // Index for title searches
  db.query('CREATE INDEX idx_books_title ON books(title(255))', (err) => {
    if (err) {
      console.error('Error creating title index:', err.message);
    } else {
      console.log('Title index created successfully');
    }
  });
  
  // Index for price ranges
  db.query('CREATE INDEX idx_books_price ON books(price)', (err) => {
    if (err) {
      console.error('Error creating price index:', err.message);
    } else {
      console.log('Price index created successfully');
    }
  });
};

// Run index creation
createIndices();

// Simple connectivity check endpoint
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'online', timestamp: new Date().toISOString() });
});

// Health check endpoint for AWS ECS
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'mpp-backend' });
});

// Use authentication routes
app.use('/auth', authRoutes);

// Monitoring routes (admin only)
app.get('/monitoring/users', authenticate, authorize(['admin']), getMonitoredUsers);
app.put('/monitoring/users/:id', authenticate, authorize(['admin']), updateMonitoredStatus);
app.delete('/monitoring/resolved', authenticate, authorize(['admin']), deleteResolvedLogs);
app.post('/monitoring/simulate', authenticate, simulateActivity);

// Start the monitoring service
const monitoringStatus = startMonitoringService(io);
console.log('Monitoring service status:', monitoringStatus);

// Complex statistical query endpoints
// Get book statistics by genre with rating aggregations
app.get('/stats/books/by-genre', (req, res) => {
  const q = `
    SELECT 
      IFNULL(SUBSTRING_INDEX(genres, ',', 1), 'Unknown') AS primary_genre,
      COUNT(*) AS book_count,
      ROUND(AVG(rating), 2) AS avg_rating,
      MIN(rating) AS min_rating,
      MAX(rating) AS max_rating,
      ROUND(AVG(price), 2) AS avg_price,
      SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS high_rated_count
    FROM 
      books
    GROUP BY 
      primary_genre
    HAVING 
      primary_genre IS NOT NULL
    ORDER BY 
      book_count DESC, avg_rating DESC
  `;
  
  db.query(q, (err, result) => {
    if (err) {
      console.log('Genre query error:', err);
      return res.status(500).json({ error: 'Error fetching genre statistics' });
    }
    // Set proper content type and send the JSON result
    res.setHeader('Content-Type', 'application/json');
    console.log('Genre statistics response:', JSON.stringify(result).substring(0, 200) + '...');
    res.json(result);
  });
});

// Get top authors by average book rating (with book counts)
app.get('/stats/authors/top-rated', (req, res) => {
  const limit = req.query.limit || 10;
  const minBooks = req.query.minBooks || 3;
  
  const q = `
    SELECT 
      a.id,
      a.name,
      COUNT(b.id) AS book_count,
      ROUND(AVG(b.rating), 2) AS avg_rating,
      ROUND(MIN(b.rating), 1) AS min_rating,
      ROUND(MAX(b.rating), 1) AS max_rating,
      ROUND(AVG(b.price), 2) AS avg_price
    FROM 
      authors a
    JOIN 
      books b ON a.id = b.author
    GROUP BY 
      a.id, a.name
    HAVING 
      COUNT(b.id) >= ?
    ORDER BY 
      avg_rating DESC, book_count DESC
    LIMIT ?
  `;
  
  db.query(q, [minBooks, parseInt(limit)], (err, result) => {
    if (err) {
      console.log('Authors query error:', err);
      return res.status(500).json({ error: 'Error fetching top authors' });
    }
    // Set proper content type and send the JSON result
    res.setHeader('Content-Type', 'application/json');
    console.log('Authors response:', JSON.stringify(result).substring(0, 200) + '...');
    res.json(result);
  });
});

// Price range distribution for books
app.get('/stats/books/price-distribution', (req, res) => {
  const q = `
    SELECT 
      CASE
        WHEN price < 20 THEN 'Under $20'
        WHEN price >= 20 AND price < 40 THEN '$20-$40'
        WHEN price >= 40 AND price < 60 THEN '$40-$60'
        WHEN price >= 60 AND price < 80 THEN '$60-$80'
        ELSE 'Over $80'
      END AS price_range,
      COUNT(*) AS book_count,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM 
      books
    GROUP BY 
      price_range
    ORDER BY 
      MIN(price)
  `;
  
  db.query(q, (err, result) => {
    if (err) {
      console.log('Price distribution query error:', err);
      return res.status(500).json({ error: 'Error fetching price distribution' });
    }
    // Set proper content type and send the JSON result
    res.setHeader('Content-Type', 'application/json');
    console.log('Price distribution response:', JSON.stringify(result).substring(0, 200) + '...');
    res.json(result);
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial book data when client connects
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      console.error('Error fetching initial books:', err);
    } else {
      socket.emit('initialData', results);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Storage configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniquePreffix + '-' + file.originalname)
  },
});

const upload = multer({ storage })

// File upload endpoint (auth protected)
app.post('/upload', authenticate, upload.single('file'), (req, res) => {
  res.send('File uploaded successfully!')
})

app.get('/media/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `media/${filename}`;
  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error downloading file');
    }
  });
});

// Books and authors endpoints with authentication and logging
const selectQuery = `SELECT books.id, books.title, authors.name AS author, books.genres, books.description, books.cover, books.rating, books.price
FROM books
JOIN authors ON books.author = authors.id`;

// Get all books (no auth required, but they'll be associated with the user if logged in)
app.get('/books', async (req, res) => {
  try {
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error getting books' });
      }
      return res.json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get paginated books
app.get('/books/page/:index', (req, res) => {
  const page = parseInt(req.params.index);
  const pageSize = 10;
  const offset = page * pageSize;
  
  const q =` 
    SELECT books.id, books.title, authors.name AS author, books.genres, books.description, books.cover, books.rating, books.price
    FROM books
    JOIN authors ON books.author = authors.id
    LIMIT ? OFFSET ?
  `;
  
  db.query(q, [pageSize, offset], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting paginated books' });
    }
    return res.json(results);
  });
});

// Get paginated books sorted by rating (ascending)
app.get('/books/page/:index/sort', (req, res) => {
  const page = parseInt(req.params.index);
  const pageSize = 10;
  const offset = page * pageSize;
  
  const q = `
    ${selectQuery}
    ORDER BY rating
    LIMIT ? OFFSET ?
  `;
  
  db.query(q, [pageSize, offset], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting sorted books' });
    }
    return res.json(results);
  });
});

// Get paginated books sorted by rating (descending)
app.get('/books/page/:index/sort/reverse', (req, res) => {
  const page = parseInt(req.params.index);
  const pageSize = 10;
  const offset = page * pageSize;
  
  const q = `
    ${selectQuery}
    ORDER BY rating DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(q, [pageSize, offset], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting reverse-sorted books' });
    }
    return res.json(results);
  });
});

// Search books by title
app.get('/books/search/:search', (req, res) => {
  const searchTerm = `%${req.params.search}%`;
  
  const q = `
    ${selectQuery}
    WHERE books.title LIKE ?
  `;
  
  db.query(q, [searchTerm], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error searching books by title' });
    }
    return res.json(results);
  });
});

// Search books by title and author
app.get('/books/search/:search/author/:author', (req, res) => {
  const searchTerm = `%${req.params.search}%`;
  const author = req.params.author;
  
  const q = `
    ${selectQuery}
    WHERE books.title LIKE ? AND authors.name = ?
  `;
  
  db.query(q, [searchTerm, author], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error searching books by title and author' });
    }
    return res.json(results);
  });
});

// Get books by author
app.get('/books/author/:author', (req, res) => {
  const author = req.params.author;
  console.log(author);
  const q = `
    SELECT * FROM books
    JOIN authors ON books.author = authors.id
    WHERE authors.name LIKE ?
  `;
  
  db.query(q, [author], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting books by author' });
    }
    return res.json(results);
  });
});

// Get total count of books (for pagination)
app.get('/books/count', (req, res) => {
  const q = 'SELECT COUNT(*) as total FROM books';
  
  db.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting book count' });
    }
    return res.json(result[0]);
  });
});

// Get a single book
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const q = selectQuery + ' WHERE books.id = ?';
  
  db.query(q, [bookId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting book' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    return res.json(results[0]);
  });
});

// Create a book (auth required)
app.post('/books', authenticate, logAction('books'), (req, res) => {
  const { title, author, genres, description, cover, rating, price } = req.body;
  
  const q = 'INSERT INTO books (title, author, genres, description, cover, rating, price) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(q, [title, author, genres, description, cover, rating, price], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error creating book' });
    }
    
    const newBookId = result.insertId;
    
    // Broadcast book update
    broadcastBookUpdate();
    
    return res.status(201).json({ id: newBookId, message: 'Book created successfully' });
  });
});

// Update a book (auth required)
app.put('/books/:id', authenticate, logAction('books'), (req, res) => {
  const bookId = req.params.id;
  const { title, author, genres, description, cover, rating, price } = req.body;
  
  const q = 'UPDATE books SET title = ?, author = ?, genres = ?, description = ?, cover = ?, rating = ?, price = ? WHERE id = ?';
  
  db.query(q, [title, author, genres, description, cover, rating, price, bookId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error updating book' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Broadcast book update
    broadcastBookUpdate();
    
    return res.json({ message: 'Book updated successfully' });
  });
});

// Delete a book (auth required)
app.delete('/books/:id', authenticate, logAction('books'), (req, res) => {
  const bookId = req.params.id;
  
  const q = 'DELETE FROM books WHERE id = ?';
  
  db.query(q, [bookId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error deleting book' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Broadcast book update
    broadcastBookUpdate();
    
    return res.json({ message: 'Book deleted successfully' });
  });
});

// CRUD operations for authors with auth and logging
app.get('/authors', (req, res) => {
  db.query('SELECT * FROM authors', (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting authors' });
    }
    return res.json(results);
  });
});

// Search authors by name
app.get('/authors/search/:searchTerm', (req, res) => {
  const searchTerm = `%${req.params.searchTerm}%`;
  
  db.query('SELECT * FROM authors WHERE name LIKE ?', [searchTerm], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error searching authors' });
    }
    return res.json(results);
  });
});

app.get('/authors/:id', (req, res) => {
  const authorId = req.params.id;
  
  db.query('SELECT * FROM authors WHERE id = ?', [authorId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting author' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    return res.json(results[0]);
  });
});

app.post('/authors', authenticate, logAction('authors'), (req, res) => {
  const { name } = req.body;
  
  db.query('INSERT INTO authors (name) VALUES (?)', [name], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error creating author' });
    }
    
    return res.status(201).json({ id: result.insertId, message: 'Author created successfully' });
  });
});

app.put('/authors/:id', authenticate, logAction('authors'), (req, res) => {
  const authorId = req.params.id;
  const { name } = req.body;
  
  db.query('UPDATE authors SET name = ? WHERE id = ?', [name, authorId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error updating author' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    return res.json({ message: 'Author updated successfully' });
  });
});

app.delete('/authors/:id', authenticate, logAction('authors'), (req, res) => {
  const authorId = req.params.id;
  
  // Check if the author has any associated books
  db.query('SELECT * FROM books WHERE author = ?', [authorId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error checking books' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'Cannot delete author with associated books' });
    }
    
    // Delete the author
    db.query('DELETE FROM authors WHERE id = ?', [authorId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error deleting author' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }
      
      return res.json({ message: 'Author deleted successfully' });
    });
  });
});

// Broadcast book updates to all connected clients
const broadcastBookUpdate = () => {
  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching books for broadcast:', err);
    } else {
      io.emit('bookUpdate', results);
    }
  });
};

// User book collection endpoints
// Get user's book collection
app.get('/users/books', authenticate, (req, res) => {
  const userId = req.user.id;
  
  const q = `
    SELECT b.id, b.title, a.name AS author, b.genres, b.description, b.cover, b.rating, b.price, ub.added_at
    FROM users_books ub
    JOIN books b ON ub.book_id = b.id
    JOIN authors a ON b.author = a.id
    WHERE ub.user_id = ?
    ORDER BY ub.added_at DESC
  `;
  
  db.query(q, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error getting user book collection' });
    }
    return res.json(results);
  });
});

// Add book to user's collection
app.post('/users/books/:bookId', authenticate, (req, res) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;
  
  // Check if the book exists
  db.query('SELECT id FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error checking book existence' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Add book to user's collection
    const q = 'INSERT INTO users_books (user_id, book_id) VALUES (?, ?)';
    
    db.query(q, [userId, bookId], (err, result) => {
      if (err) {
        // If duplicate entry error (book already in collection)
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Book already in collection' });
        }
        
        console.log(err);
        return res.status(500).json({ error: 'Error adding book to collection' });
      }
      
      return res.status(201).json({ message: 'Book added to collection successfully' });
    });
  });
});

// Remove book from user's collection
app.delete('/users/books/:bookId', authenticate, (req, res) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;
  
  const q = 'DELETE FROM users_books WHERE user_id = ? AND book_id = ?';
  
  db.query(q, [userId, bookId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error removing book from collection' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found in collection' });
    }
    
    return res.json({ message: 'Book removed from collection successfully' });
  });
});

// Error handler (must be last)
app.use(errorHandler);

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export {app, db};