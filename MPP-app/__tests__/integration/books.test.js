// __tests__/integration/books.test.js
import { app, db } from '../../../Backend/index.js';
import axios from 'axios';

describe('Books API', () => {
  describe('GET http://localhost:8800/books', () => {
    it('should return all books', async () => {
      const res = await axios.get('http://localhost:8800/books');
      expect(res.status).toEqual(200);
      expect(res.data).toBeDefined();
    });
  });})

  describe('GET http://localhost:8800/books/:id', () => {
    it('should return a single book', async () => {
      // First insert a test book
      const result = await db.query(
        `INSERT INTO books 
         (title, author, price) VALUES ('Test Book', 'Test Author', ${5})`
      );
      
      const res = await axios.get(`http://localhost:8800/books/author/${"Test Author"}`);
      expect(res.status).toEqual(200);
      console.log(res.data)
      expect(res.data[0].Author).toEqual("Test Author");
      
      // Cleanup
      await db.query('DELETE FROM books WHERE author = ?', "Test Author");
    });

    it('should return 404 for non-existent book', async () => {
      const res = await axios.get(`http://localhost:8800/books/author/${"Not Test Author"}`);
      expect(res.data).toEqual([]);
    });
  });

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Test Book',
        author: 'Test Author',
        genres: 'Testing',
        desc: 'Test Description',
        cover: 'test.jpg',
        rating: 9,
        price: 39.99
      };

      const res = await axios.post('http://localhost:8800/books', newBook);
      
      expect(res.status).toEqual(200);
      
      // Verify it exists in DB
      const book = await db.query(
        'SELECT * FROM books WHERE title = ?', 
        newBook.title
      );
      expect(book).toBeDefined();
      
      // Cleanup
      await db.query('DELETE FROM books WHERE author = ?', "Test Author");
    });
  });

  describe('PUT http://localhost:8800/books/:id', () => {
    it('should update an existing book', async () => {
      // First create a test book
      const insertResult = await db.query(
        `INSERT INTO books 
         (title, author, price) VALUES ('Original Title', 'Original Author', ${5})`
      );

      const updates = {
        title: 'Updated Title',
        author: 'Updated Author',
        genres: 'Updated',
        desc: 'Updated description',
        cover: 'updated.jpg',
        rating: 10,
        price: 49.99
      };

      const res = await axios.put(`http://localhost:8800/books/author/${"Test Author"}`, updates);

      expect(res.status).toEqual(200);
      
      // Verify updates
      const updatedBook = await db.query(
        'SELECT * FROM books WHERE title = "Updated Title"'
      );
      expect(updatedBook.title).toBe(updates.title);
      
      // Cleanup
      await db.query('DELETE FROM books WHERE author = ?', "Test Author");
    });
  });

//   describe('DELETE /books/:id', () => {
//     it('should delete a book', async () => {
//       // First create a test book
//       const insertResult = await db.query(
//         `INSERT INTO books 
//          (title, author) VALUES ('Book to Delete', 'Test Author')`
//       );
//       const bookId = insertResult.insertId;
      
//       const res = await app.delete(`http://localhost:8800/books/${bookId}`);
//       expect(res.statusCode).toEqual(200);
      
//       // Verify deletion
//       const [deleted] = await db.query(
//         'SELECT * FROM books WHERE id = ?',
//         [bookId]
//       );
//       expect(deleted).toBeUndefined();
//     });
//   });
// });