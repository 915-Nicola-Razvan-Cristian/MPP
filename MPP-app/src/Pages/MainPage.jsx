import React, { use } from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";
import '../Components/SortButton/SortButton.css'
import './MainPage.css'

import axios from 'axios'
import { useEffect } from 'react'

import { useState } from 'react'

function MainPage() {

  const [books, setBooks] = useState([])

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:8800/books')
        console.log(res)
        setBooks(res.data)
      }
      catch (err) {
        console.log(err)
      }
    }
    fetchBooks()
  }, [])


  const filterHandler = async () => {
    const author = document.getElementById("author").value;
    if(document.getElementById("search").value !== ''){
      filter_search()
    }
    if(author === ''){
      axios.get('http://localhost:8800/books').then(res => {
        setBooks(res.data)
      })
      return
    }
    try {
      const res = await axios.get(`http://localhost:8800/books/author/${author}`)
      console.log(res)
      setBooks(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }

  const searchHandler = async () => {
    const search = document.getElementById("search").value;
    if(document.getElementById("author").value !== ''){
      filter_search()}
    if(search === ''){
      axios.get('http://localhost:8800/books').then(res => {
        setBooks(res.data)
      })
      return
    }
    try {
      const res = await axios.get(`http://localhost:8800/books/search/${search}`)
      console.log(res)
      setBooks(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }


  const filter_search = async () => {
    const author = document.getElementById("author").value;
    const search = document.getElementById("search").value;
    try {
      const res = await axios.get(`http://localhost:8800/books/search/${search}/author/${author}`)
      console.log(res)
      setBooks(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }




  return (
    <>
      <div>
        <Title title="OnlyBooks"/>
        <Navbar />
        <AddButton />
        <div className="sort-button">
          
        </div>

        
        <div class="group">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
            <g>
              <path
                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
              ></path>
            </g>
          </svg>
          <input onChange={searchHandler}
            id="search"
            className="input"
            type="search"
            placeholder="Search..."
            name="searchbar"
          />
          <input className='input' id='author' type="text" placeholder="Author name" onKeyDown={(e) => {if(e.key.match('Enter')) filterHandler()}} />
        </div>

        <div className="content-container">
          {books.map((book, index) => (
            console.log(book),
            <Card key={index} book={book} />
          ))}
        </div>
      </div>
    </>
  );
}

export default MainPage;