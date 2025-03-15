import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Title from './Components/Title/Title'
import Navbar from './Components/Navbar/Navbar'
import './Components/Content/Content.css'
import Card from './Components/Card/Card'
import AddButton from './Components/AddButton/AddButton'
import MainPage from './Pages/MainPage'
import AddForm from './Pages/AddForm'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Router>
            <Routes>
                <Route path="" element={<MainPage/>}/>
                <Route path='/addform' element={<AddForm/>}/>
            </Routes>
        </Router>
    </>
  )
}
export default App
