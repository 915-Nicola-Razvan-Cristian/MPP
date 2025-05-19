import useConnectivityStatus from './Hooks/useConnectivityStatus'
import './App.css'
import './Components/Content/Content.css'
import MainPage from './Pages/MainPage'
import AddForm from './Pages/AddForm'
import UpdatePage from './Pages/UpdatePage'
import Charts from './Pages/Charts'
import MediaPage from './Pages/MediaPage'
import DownloadPage from './Pages/DownloadPage'
import Authors from './Pages/Authors'
import UpdateAuthorPage from './Pages/UpdateAuthorPage'
import LoginPage from './Pages/LoginPage'
import RegisterPage from './Pages/RegisterPage'
import AdminDashboardPage from './Pages/AdminDashboardPage'
import CollectionPage from './Pages/CollectionPage'
import Navbar from './Components/Navbar'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import FileUpload from './Pages/FileUpload'
import { AuthProvider, useAuth } from './utils/AuthContext'

// Protected route component that checks authentication
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  const { isOfflineMode } = useConnectivityStatus("http://localhost:8800/");

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="" element={<MainPage isOfflineMode={isOfflineMode}/>}/>
        <Route path='/addform' element={
          <ProtectedRoute>
            <AddForm isOfflineMode={isOfflineMode}/>
          </ProtectedRoute>
        }/>
        <Route path='/update/:id' element={
          <ProtectedRoute>
            <UpdatePage isOfflineMode={isOfflineMode}/>
          </ProtectedRoute>
        }/>
        <Route path='/charts' element={<Charts isOfflineMode={isOfflineMode}/>}/>
        <Route path='/uploads' element={
          <ProtectedRoute>
            <FileUpload isOfflineMode={isOfflineMode}/>
          </ProtectedRoute>
        }/>
        <Route path="/media/*" element={<MediaPage isOfflineMode={isOfflineMode}/>}/>
        <Route path="/downloads" element={<DownloadPage isOfflineMode={isOfflineMode}/>}/>
        <Route path='/authors' element={<Authors isOfflineMode={isOfflineMode}/>}/>
        <Route path='/updateauthor/:id' element={
          <ProtectedRoute>
            <UpdateAuthorPage isOfflineMode={isOfflineMode}/>
          </ProtectedRoute>
        }/>
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/register' element={<RegisterPage />}/>
        <Route path='/collection' element={
          <ProtectedRoute>
            <CollectionPage />
          </ProtectedRoute>
        }/>
        <Route path='/admin/dashboard' element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }/>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App
