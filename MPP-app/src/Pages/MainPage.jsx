import React, { use } from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";
import '../Components/SortButton/SortButton.css'

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
    try {
      const res = await axios.get(`http://localhost:8800/books/search/${search}`)
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
        <Title />
        <Navbar />
        <AddButton />
        <div className="sort-button">
          <input id='author' type="text" placeholder="Author name" />
          <button onClick={filterHandler}>Filter by author</button>
        </div>
        <div className="search-container">
          <input id='search' type="text" placeholder="Search..." />
          <button onClick={searchHandler}>Search</button>
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