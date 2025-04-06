import express from 'express'
import mysql from 'mysql'
import cors from 'cors'

import { Server } from 'socket.io'
import { createServer } from 'http'
import { title } from 'process'
import { start } from 'repl'

const app = express()
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
})


let books = [];
let nextId = 1;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
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


// Broadcast book updates to all connected clients
const broadcastBookUpdate = () => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      console.error('Error fetching books for broadcast:', err);
    } else {
      io.emit('bookUpdate', results);
    }
  });
};


 io.on('connection', (socket) => {
   console.log('New client connected:', socket.id);
   console.log('Total clients:', io.engine.clientsCount);
  
   socket.onAny((event, ...args) => {
     console.log(`Got ${event} with args:`, args);
   });
 });





// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Razvan2005'

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json('Msg from backend server.')
})


app.get('/books/:id', (req, res) => {
  const q = `SELECT * FROM books WHERE id = ?`
  db.query(q, [req.params.id], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})


app.get('/books', (req, res) => {
  const q ='SELECT * FROM books'
  db.query(q, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

app.get('/books/author/:author', (req, res) => {
  const q = `SELECT * FROM books WHERE author = ?`
  db.query(q, [req.params.author], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

app.get('/books/search/:search', (req, res) => {
  const q = `SELECT * FROM books WHERE title LIKE ?`
  db.query(q, [`%${req.params.search}%`], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

app.get('/books/search/:search/author/:author', (req, res) => {
  const q = `SELECT * FROM books WHERE title LIKE ? AND author = ?`
  db.query(q, [`%${req.params.search}%`, req.params.author], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

app.post('/books', (req, res) => {
  //const { title, author, desc, cover } = req.body
  const q = `INSERT INTO books (title, author, genres, description, cover, rating, price) VALUES (?)`
  const values = [[req.body.title, req.body.author, req.body.genres, req.body.desc, req.body.cover, req.body.rating, req.body.price]]
  db.query(q, values, (err, result) => {
    if (err) { 
      console.log(err)
    } else {
      res.json('Book added.')
      broadcastBookUpdate();
    }
  })
})


app.delete('/books/:id', (req, res) => {
  const q = `DELETE FROM books WHERE id = ?`
  db.query(q, [req.params.id], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json('Book deleted.')
      broadcastBookUpdate();
    }
  })
})


app.get('/books/page/:index', (req, res) => {
  const page = req.params.index;
  const q = `SELECT * FROM books LIMIT 8 OFFSET ${8 * page}`
  db.query(q, (err, result) => {
    if(err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})


app.put('/books/:id', (req, res) => {
  const q = `UPDATE books SET title = ?, author = ?, genres = ?, description = ?, cover = ?, rating = ?, price = ? WHERE id = ?`
  const values = [req.body.title, req.body.author, req.body.genres, req.body.desc, req.body.cover, req.body.rating, req.body.price, req.params.id]
  db.query(q, values, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json('Book updated.')
      broadcastBookUpdate();
    }
  })
})

app.put('/books/author/:author', (req, res) => {
  const q = `UPDATE books SET title = ?, author = ?, genres = ?, description = ?, cover = ?, rating = ?, price = ? WHERE author = ?`
  const values = [req.body.title, req.body.author, req.body.genres, req.body.desc, req.body.cover, req.body.rating, req.body.price, req.params.id]
  db.query(q, values, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json('Book updated.')
      broadcastBookUpdate();
    }
  })
})

// app.get('/books/page/:index', (req, res) => {
//   const pageIndex = parseInt(req.params.index)
//   const pageSize = 8;
//   const startIndex = pageIndex * pageSize;
//   const paginatedBooks = books.slice(startIndex, startIndex + pageSize)
//   res.json(books)
// })


app.get('/books/page/:index/sort', (req, res) => {
  const page = req.params.index;
  const q = `SELECT * FROM books  ORDER BY rating LIMIT 8 OFFSET ${8 * page}`;
  db.query(q, (err, result) => {
    if(err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

app.get('/books/page/:index/sort/reverse', (req, res) => {
  const page = req.params.index;
  const q = `SELECT * FROM books  ORDER BY rating DESC LIMIT 8 OFFSET ${8 * page}`;
  db.query(q, (err, result) => {
    if(err) {
      console.log(err)
    } else {
      res.json(result)
    }
  })
})

// app.post('/books', (req, res) => {
//   const newBook = {
//     id: nextId++,
//     ...req.body
//   }
//   books.push(newBook)
//   res.json("Book added");
//   broadcastBookUpdate();
// })


// app.delete('/books/:id', (req, res) => {
//   const bookId = parseInt(req.params.id);
//   books = books.filter(book => book.id !== bookId);
//   res.json('Book deleted.');
//   broadcastBookUpdate();
// })


// app.put('/books/:id', (req, res) => {
//   const bookId = parseInt(req.params.id);
//   const index = books.findIndex(book => book.id === bookId);

//   if (index !== -1) {
//     books[index] = { ...books[index], ...req.body };
//     res.json('Book updated.');
//     broadcastBookUpdate();
//   } else {
//     res.status(404).json('Book not found.');
//   }
// })


// app.get('/books/:id', (req, res) => {
//   const bookId = parseInt(req.params.id);
//   const book = books.find(book => book.id === bookId);

//   if (book) {
//     res.json(book);
//   } else {
//     res.status(404).json('Book not found.');
//   }
// })


httpServer.listen(8800, () => {
  console.log('Connected to backend server.')
})

export {app, db};