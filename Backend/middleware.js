import jwt from 'jsonwebtoken';
import mysql from 'mysql';

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
});

// JWT Secret
const JWT_SECRET = "library_monitoring_secret_key"; // In a real app, this would be in an env variable

// Authenticate JWT tokens
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.log('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check if user has specified role
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
    }
    
    next();
  };
};

// Log user actions (CRUD operations)
export const logAction = (entityType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      const { user } = req;
      
      if (!user) {
        return originalSend.call(this, body);
      }
      
      try {
        // Parse response body
        let parsedBody;
        try {
          parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          parsedBody = body;
        }
        
        // Determine action type based on HTTP method
        let actionType;
        let entityId = req.params.id;
        
        switch (req.method) {
          case 'POST':
            actionType = 'CREATE';
            // For creation, we might need to extract the ID from the response
            if (parsedBody && parsedBody.id) {
              entityId = parsedBody.id;
            } else if (parsedBody && parsedBody.insertId) {
              entityId = parsedBody.insertId;
            }
            break;
          case 'GET':
            actionType = 'READ';
            break;
          case 'PUT':
          case 'PATCH':
            actionType = 'UPDATE';
            break;
          case 'DELETE':
            actionType = 'DELETE';
            break;
          default:
            actionType = 'READ';
        }
        
        // Only log if the status is in the 2xx range (success)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const details = JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            requestBody: req.body,
            statusCode: res.statusCode
          });
          
          db.query(
            'INSERT INTO action_logs (user_id, action_type, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [user.id, actionType, entityType, entityId || 0, details],
            (err) => {
              if (err) {
                console.error('Error logging action:', err);
              }
            }
          );
        }
      } catch (error) {
        console.error('Error in logging middleware:', error);
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Global error:', err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}; 