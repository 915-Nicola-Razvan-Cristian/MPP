import mysql from 'mysql';

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Razvan2005',
  database: 'lib_db'
});

// Configuration
const MONITORING_INTERVAL = 60000; // Check every minute
const SUSPICIOUS_THRESHOLD = 20; // Number of actions within time window to be considered suspicious
const TIME_WINDOW_MINUTES = 5; // Time window in minutes

// Start the monitoring service
export const startMonitoringService = (io) => {
  console.log('Starting user activity monitoring service...');
  
  // Run the first check immediately
  checkForSuspiciousActivity(io);
  
  // Then schedule regular checks
  setInterval(() => {
    checkForSuspiciousActivity(io);
  }, MONITORING_INTERVAL);
  
  return {
    status: 'running',
    interval: MONITORING_INTERVAL,
    threshold: SUSPICIOUS_THRESHOLD,
    timeWindow: TIME_WINDOW_MINUTES
  };
};

// Check for suspicious activity
const checkForSuspiciousActivity = async (io) => {
  console.log('Checking for suspicious user activity...');
  
  try {
    // Find users with too many actions in the time window
    // Using query with parameters
    const query = `
      SELECT 
        user_id, 
        COUNT(*) as action_count,
        u.username,
        MIN(timestamp) as first_action,
        MAX(timestamp) as last_action
      FROM 
        action_logs l
      JOIN
        users u ON l.user_id = u.id
      WHERE 
        timestamp > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      GROUP BY 
        user_id
      HAVING 
        COUNT(*) >= ?
    `;
    
    db.query(query, [TIME_WINDOW_MINUTES, SUSPICIOUS_THRESHOLD], (err, results) => {
      if (err) {
        console.error('Error in suspicious activity check:', err);
        return;
      }
      
      if (results.length > 0) {
        console.log(`Found ${results.length} suspicious users`);
        
        // Process each suspicious user
        results.forEach(user => {
          const reason = `Performed ${user.action_count} actions between ${user.first_action} and ${user.last_action}`;
          
          // Check if user is already monitored
          db.query('SELECT * FROM monitored_users WHERE user_id = ? AND status = "ACTIVE"', [user.user_id], (err, monitored) => {
            if (err) {
              console.error('Error checking monitored status:', err);
              return;
            }
            
            if (monitored.length === 0) {
              // Add user to monitored list
              db.query(
                'INSERT INTO monitored_users (user_id, reason) VALUES (?, ?)',
                [user.user_id, reason],
                (err) => {
                  if (err) {
                    console.error('Error adding user to monitored list:', err);
                    return;
                  }
                  
                  console.log(`Added user ${user.username} (ID: ${user.user_id}) to monitored list`);
                  
                  // Notify admins via socket.io if available
                  if (io) {
                    io.emit('suspicious_activity', {
                      userId: user.user_id,
                      username: user.username,
                      actionCount: user.action_count,
                      timeWindow: TIME_WINDOW_MINUTES,
                      reason
                    });
                  }
                }
              );
            }
          });
        });
      } else {
        console.log('No suspicious activity detected');
      }
    });
  } catch (error) {
    console.error('Error in activity monitoring:', error);
  }
};

// Get the list of monitored users
export const getMonitoredUsers = (req, res) => {
  const query = `
    SELECT 
      m.id, 
      m.user_id, 
      u.username, 
      m.reason, 
      m.detected_at, 
      m.status,
      COUNT(l.id) as action_count
    FROM 
      monitored_users m
    JOIN 
      users u ON m.user_id = u.id
    LEFT JOIN 
      action_logs l ON m.user_id = l.user_id
    GROUP BY 
      m.id, m.user_id, u.username, m.reason, m.detected_at, m.status
    ORDER BY 
      m.detected_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching monitored users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
};

// Update monitored user status
export const updateMonitoredStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!id || !status || !['ACTIVE', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  db.query(
    'UPDATE monitored_users SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error('Error updating monitored status:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Monitored user not found' });
      }
      
      res.json({ message: 'Status updated successfully' });
    }
  );
};

// Delete all resolved monitored users
export const deleteResolvedLogs = (req, res) => {
  const query = 'DELETE FROM monitored_users WHERE status = "RESOLVED"';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error deleting resolved logs:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ message: 'No resolved logs to delete' });
    }
    
    res.json({ 
      message: 'Resolved logs deleted successfully', 
      deletedCount: result.affectedRows 
    });
  });
};

// Simulate a suspicious activity (for testing)
export const simulateActivity = (req, res) => {
  const { userId, actionCount = 30 } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, users) => {
    if (err || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    const actions = [];
    
    // Create an array of action log entries
    for (let i = 0; i < actionCount; i++) {
      const actionType = ['CREATE', 'READ', 'UPDATE', 'DELETE'][Math.floor(Math.random() * 4)];
      const entityType = ['books', 'authors'][Math.floor(Math.random() * 2)];
      const entityId = Math.floor(Math.random() * 100) + 1;
      
      actions.push([user.id, actionType, entityType, entityId, '{}']);
    }
    
    // Insert actions in batches
    const query = 'INSERT INTO action_logs (user_id, action_type, entity_type, entity_id, details) VALUES ?';
    db.query(query, [actions], (err, result) => {
      if (err) {
        console.error('Error simulating activity:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        message: `Successfully simulated ${actionCount} actions for user ${user.username}`,
        insertedCount: result.affectedRows
      });
    });
  });
}; 