import mysql from 'mysql';

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
  setupDatabase();
});

async function setupDatabase() {
  try {
    // Create roles table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        role_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);
    
    // Create logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action_type ENUM('CREATE', 'READ', 'UPDATE', 'DELETE') NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create monitored users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS monitored_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        reason VARCHAR(255) NOT NULL,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('ACTIVE', 'RESOLVED') DEFAULT 'ACTIVE',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create UsersBooks table for user book collections
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users_books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE KEY user_book_unique (user_id, book_id)
      )
    `);
    
    // Insert default roles if they don't exist
    await executeQuery(`
      INSERT IGNORE INTO roles (name) VALUES ('admin'), ('user')
    `);
    
    // Insert default admin user if it doesn't exist
    // Password: admin123 (in a real app, this would be hashed)
    await executeQuery(`
      INSERT IGNORE INTO users (username, password, email, role_id)
      SELECT 'admin', 'admin123', 'admin@example.com', id 
      FROM roles WHERE name = 'admin'
    `);
    
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    db.query(query, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  db.end();
  process.exit(1);
}); 