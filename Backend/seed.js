import mysql from 'mysql';
import { faker } from '@faker-js/faker';

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  seedDatabase();
});

// Configuration
const AUTHOR_COUNT = 1000;
const BOOKS_COUNT = 10000;

async function seedDatabase() {
  try {
    // Clear existing data (optional)
    await clearTables();
    
    // Generate and insert authors
    console.log('Generating authors...');
    const authorIds = await generateAuthors(AUTHOR_COUNT);
    
    // Generate and insert books
    console.log('Generating books...');
    await generateBooks(BOOKS_COUNT, authorIds);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Clear existing data
function clearTables() {
  return new Promise((resolve, reject) => {
    console.log('Clearing existing data...');
    
    // Foreign key constraints may require clearing books first
    db.query('DELETE FROM books', (err) => {
      if (err) return reject(err);
      
      db.query('DELETE FROM authors', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// Generate authors
function generateAuthors(count) {
  return new Promise((resolve, reject) => {
    const authors = [];
    const authorIds = [];
    
    for (let i = 0; i < count; i++) {
      const name = faker.person.fullName();
      authors.push([name]);
    }
    
    // Use batch insert for better performance
    const q = 'INSERT INTO authors (name) VALUES ?';
    db.query(q, [authors], (err, result) => {
      if (err) return reject(err);
      
      // Get the range of IDs generated
      const firstId = result.insertId;
      for (let i = 0; i < count; i++) {
        authorIds.push(firstId + i);
      }
      
      console.log(`${count} authors created`);
      resolve(authorIds);
    });
  });
}

// Generate books
function generateBooks(count, authorIds) {
  return new Promise((resolve, reject) => {
    const books = [];
    const batchSize = 1000; // Insert in smaller batches to avoid packet size limits
    
    console.log('Preparing book data...');
    
    for (let i = 0; i < count; i++) {
      const title = faker.commerce.productName().substring(0, 100); // Limit title length
      const authorId = authorIds[Math.floor(Math.random() * authorIds.length)];
      // Limit to just 1-2 genres with shorter text
      const genres = faker.helpers.arrayElements(['Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Bio', 'History'], { min: 1, max: 2 }).join(', ').substring(0, 50);
      // Use a single shorter paragraph instead of multiple
      const description = faker.lorem.paragraph().substring(0, 50);
      // Generate a shorter URL for cover
      const cover = `https://picsum.photos/id/${faker.number.int(1000)}/200/300`.substring(0, 200);
      const rating = parseFloat(faker.number.float({ min: 1, max: 10, precision: 0.1 })).toFixed(1);
      const price = parseFloat(faker.commerce.price({ min: 5, max: 100 })).toFixed(2);
      
      books.push([title, authorId, genres, description, cover, rating, price]);
      
      // Log progress
      if (i > 0 && i % 1000 === 0) {
        console.log(`Prepared ${i} book records...`);
      }
    }
    
    console.log('Inserting books in batches...');
    insertBookBatches(books, batchSize, 0, resolve, reject);
  });
}

// Insert books in batches to avoid packet size limits
function insertBookBatches(books, batchSize, startIndex, resolve, reject) {
  if (startIndex >= books.length) {
    console.log(`${books.length} books created`);
    return resolve();
  }
  
  const endIndex = Math.min(startIndex + batchSize, books.length);
  const batch = books.slice(startIndex, endIndex);
  
  const q = 'INSERT INTO books (title, author, genres, description, cover, rating, price) VALUES ?';
  db.query(q, [batch], (err) => {
    if (err) return reject(err);
    
    console.log(`Inserted batch: ${startIndex} to ${endIndex - 1}`);
    insertBookBatches(books, batchSize, endIndex, resolve, reject);
  });
}

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  db.end();
  process.exit(1);
});
