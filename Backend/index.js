import express from 'express'
import mysql from 'mysql'   // Import MySQL
import cors from 'cors'

const app = express()
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
})

// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Razvan2005'

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json('Msg from backend server.')
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

app.post('/books', (req, res) => {
  //const { title, author, desc, cover } = req.body
  const q = `INSERT INTO books (title, author, genres, description, cover, rating) VALUES (?)`
  const values = [[req.body.title, req.body.author, req.body.genres, req.body.desc, req.body.cover, req.body.rating]]
  db.query(q, values, (err, result) => {
    if (err) { 
      console.log(err)
    } else {
      res.json('Book added.')
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
    }
  })
})


app.put('/books/:id', (req, res) => {
  const q = `UPDATE books SET title = ?, author = ?, genres = ?, description = ?, cover = ?, rating = ? WHERE id = ?`
  const values = [req.body.title, req.body.author, req.body.genres, req.body.desc, req.body.cover, req.body.rating, req.params.id]
  db.query(q, values, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json('Book updated.')
    }
  })
})


app.listen(8800, () => {
  console.log('Connected to backend server.')
})