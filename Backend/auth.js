import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';

const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
});

// JWT Secret
const JWT_SECRET = "library_monitoring_secret_key"; // In a real app, this would be in an env variable

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if username or email already exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, result) => {
      if (err) {
        console.log('Error checking user:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.length > 0) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Get the user role ID (default: 'user')
      db.query('SELECT id FROM roles WHERE name = ?', ['user'], (err, roles) => {
        if (err || roles.length === 0) {
          console.log('Error getting role:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const userRoleId = roles[0].id;
        
        // Insert the new user
        db.query(
          'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, ?)',
          [username, hashedPassword, email, userRoleId],
          (err, result) => {
            if (err) {
              console.log('Error creating user:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Generate JWT token
            const token = jwt.sign(
              { id: result.insertId, username, role: 'user' },
              JWT_SECRET,
              { expiresIn: '24h' }
            );
            
            res.status(201).json({
              message: 'User registered successfully',
              token,
              user: {
                id: result.insertId,
                username,
                email,
                role: 'user'
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.log('Error in registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find the user
    db.query(
      'SELECT users.*, roles.name as role FROM users JOIN roles ON users.role_id = roles.id WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) {
          console.log('Error finding user:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        console.log(results);
        
        if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = results[0];
        // Compare passwords
        let isPasswordValid = await bcrypt.compare(password, user.password);

        if(user.password === 'admin123' && password === 'admin123'){
            isPasswordValid = true;
        }
        if (!isPasswordValid) {
            console.log("Invalid credentials");
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log('Login successful');
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.log('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get the user data
      db.query(
        'SELECT users.id, users.username, users.email, roles.name as role FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ?',
        [decoded.id],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
          
          const user = results[0];
          
          res.json({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.log('Error getting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 