import useConnectivityStatus from './Hooks/useConnectivityStatus'
import './App.css'
import './Components/Content/Content.css'
import MainPage from './Pages/MainPage'
import AddForm from './Pages/AddForm'
import UpdatePage from './Pages/UpdatePage'
import Charts from './Pages/Charts'
import MediaPage from './Pages/MediaPage'
import DownloadPage from './Pages/DownloadPage'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FileUpload from './Pages/FileUpload'



function App() {


   const { isOfflineMode } = useConnectivityStatus("http://localhost:8800/")



  return (
    <>
        <Router>
            <Routes>
                <Route path="" element={<MainPage isOfflineMode={isOfflineMode}/>}/>
                <Route path='/addform' element={<AddForm isOfflineMode={isOfflineMode}/>}/>
                <Route path='/update/:id' element={<UpdatePage isOfflineMode={isOfflineMode}/>}></Route>
                <Route path='/charts' element={<Charts isOfflineMode={isOfflineMode}/>}/>
                <Route path='/uploads' element={<FileUpload isOfflineMode={isOfflineMode}/>}/>
                <Route path="/media/*" element={<MediaPage isOfflineMode={isOfflineMode}/>}/>
                <Route path="/downloads" element={<DownloadPage isOfflineMode={isOfflineMode}/>}/>
            </Routes>
        </Router>
    </>
  )
}
export default App
