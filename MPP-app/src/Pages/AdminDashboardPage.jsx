import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [monitoredUsers, setMonitoredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulateUserId, setSimulateUserId] = useState('');
  const [simulateActionCount, setSimulateActionCount] = useState(30);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState('');
  const [deletingLogs, setDeletingLogs] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Fetch monitored users
    fetchMonitoredUsers();
    
    // Set up socket connection for real-time updates
    const socket = new WebSocket('ws://localhost:8800');
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'suspicious_activity') {
        fetchMonitoredUsers(); // Refresh the list on new detection
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      socket.close();
    };
  }, [navigate]);

  const fetchMonitoredUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:8800/monitoring/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMonitoredUsers(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setError('Error fetching monitored users. Please try again.');
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:8800/monitoring/users/${userId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh the list
      fetchMonitoredUsers();
    } catch (error) {
      setError('Error updating user status. Please try again.');
    }
  };

  const handleDeleteResolvedLogs = async () => {
    // Confirm with the user before deleting
    if (!window.confirm('Are you sure you want to delete all resolved logs? This action cannot be undone.')) {
      return;
    }
    
    setDeletingLogs(true);
    setError('');
    setDeleteSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete('http://localhost:8800/monitoring/resolved', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeleteSuccess(response.data.message);
      
      // Refresh the list
      fetchMonitoredUsers();
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to delete resolved logs');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setDeletingLogs(false);
    }
  };

  const handleSimulateActivity = async (e) => {
    e.preventDefault();
    setSimulationLoading(true);
    setSimulationSuccess('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8800/monitoring/simulate', 
        { 
          userId: simulateUserId,
          actionCount: parseInt(simulateActionCount)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSimulationSuccess(response.data.message);
      setSimulationLoading(false);
      
      // Reset form
      setSimulateUserId('');
      setSimulateActionCount(30);
      
      // Monitor might take a moment to detect, so wait and refresh
      setTimeout(() => {
        fetchMonitoredUsers();
      }, 3000);
    } catch (error) {
      setSimulationLoading(false);
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Simulation failed');
      } else {
        setError('Network error. Please try again.');
      }
    }
  };

  // Count resolved and active logs
  const resolvedCount = monitoredUsers.filter(user => user.status === 'RESOLVED').length;
  const activeCount = monitoredUsers.filter(user => user.status === 'ACTIVE').length;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={fetchMonitoredUsers} className="refresh-button">
            Refresh
          </button>
          <button 
            onClick={handleDeleteResolvedLogs} 
            className="delete-logs-button"
            disabled={deletingLogs || resolvedCount === 0}
          >
            {deletingLogs ? 'Deleting...' : `Delete Resolved Logs (${resolvedCount})`}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {simulationSuccess && <div className="success-message">{simulationSuccess}</div>}
      {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
      
      <div className="dashboard-content">
        <div className="monitored-users-section">
          <h2>Monitored Users</h2>
          <div className="monitored-status-summary">
            <span className="active-count">Active: {activeCount}</span>
            <span className="resolved-count">Resolved: {resolvedCount}</span>
            <span className="total-count">Total: {monitoredUsers.length}</span>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : monitoredUsers.length === 0 ? (
            <p>No monitored users found</p>
          ) : (
            <table className="monitored-users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Reason</th>
                  <th>Detected At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monitoredUsers.map((user) => (
                  <tr key={user.id} className={user.status === 'ACTIVE' ? 'active-alert' : 'resolved-alert'}>
                    <td>{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.reason}</td>
                    <td>{new Date(user.detected_at).toLocaleString()}</td>
                    <td>{user.status}</td>
                    <td>
                      {user.status === 'ACTIVE' ? (
                        <button 
                          className="resolve-button"
                          onClick={() => handleStatusChange(user.id, 'RESOLVED')}
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <button 
                          className="reactivate-button"
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="simulation-section">
          <h2>Simulate Suspicious Activity</h2>
          <form onSubmit={handleSimulateActivity}>
            <div className="form-group">
              <label htmlFor="simulateUserId">User ID</label>
              <input
                type="number"
                id="simulateUserId"
                value={simulateUserId}
                onChange={(e) => setSimulateUserId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="simulateActionCount">Number of Actions</label>
              <input
                type="number"
                id="simulateActionCount"
                value={simulateActionCount}
                onChange={(e) => setSimulateActionCount(e.target.value)}
                min="5"
                max="100"
                required
              />
            </div>
            <button 
              type="submit" 
              className="simulate-button"
              disabled={simulationLoading}
            >
              {simulationLoading ? 'Simulating...' : 'Simulate Activity'}
            </button>
          </form>
          <p className="simulation-note">
            This will generate the specified number of random CRUD operations for the given user,
            which should trigger the monitoring system if enough actions are created.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 