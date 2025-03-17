import React, { use } from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";

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

    return (
        <>
            <div>
              <Title/>
              <Navbar/>
              <AddButton/>
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