import React, { use, useRef, useCallback } from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";
import '../Components/SortButton/SortButton.css'
import './MainPage.css'
import '../Components/Pagination/Pagination.css'
import useGetBooks from "../Hooks/useGetBooks";
import axios from 'axios'
import { useEffect } from 'react'

import { clearBooks, getAllOperations, getAllBooks } from "../utils/offlineStorage";

import { useState } from 'react'
import useConnectivityStatus from "../Hooks/useConnectivityStatus";

function MainPage(props) {

  const isOfflineMode = props.isOfflineMode

  const [paginationIndex, setPaginationIndex] = useState(0);

  const { books, hasMore, isLoading, error, setBooks } = useGetBooks(paginationIndex, isOfflineMode)


  // const [books, setBooks] = useState([])
  const observerRef = useRef(null)
  const lastBookElement = useCallback(node => {
    if (isLoading) return;
    if (error) {
      console.log("Error")
      return;
    }
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log("Visible")
        setPaginationIndex(prev => prev + 1)
      }
    })
    if (node) observerRef.current.observe(node)
    console.log(node)
  }, [isLoading, hasMore])

  useEffect(() => {
    setPaginationIndex(0)
    if (observerRef.current) observerRef.current.disconnect()
    if (isOfflineMode) {
      const fetchOfflineBooks = async () => {
        const offlineBooks = await getAllBooks();
        setBooks(offlineBooks);
        console.log(offlineBooks)
      }
      fetchOfflineBooks();
    } else {
      const fetchOnlineBooks = async () => {
        try {
          const res = await axios.get(`http://localhost:8800/books/page/${paginationIndex}`);
          setBooks(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      fetchOnlineBooks();
      const syncOfflineData = async () => {
        const offlineBooks = getAllBooks();
        if (offlineBooks.length > 0) {
          for (const book of offlineBooks) {
            console.log(book)
            await axios.post("http://localhost:8800/books", book).then(res => {
            }).catch(err => {
              console.log(err)
            })
          }
          try {
            const res = await axios.get(`http://localhost:8800/books/page/${paginationIndex}`);
            setBooks(res.data);
          }
          catch (err) {
            console.log(err)
          }
        }
      }
      syncOfflineData();
      console.log(books)
      clearBooks();
    }
  }, [isOfflineMode])

  // useEffect(() => {
  //   const fetchBooks = async () => {
  //     try {
  //       const res = await axios.get(`http://localhost:8800/books/page/${paginationIndex}`, paginationIndex);
  //       console.log(res)
  //       setBooks(res.data)
  //     }
  //     catch (err) {
  //       console.log(err)
  //     }
  //   }
  //   fetchBooks()
  // }, [paginationIndex])


  // useEffect(() => {
  //   const observer = new IntersectionObserver((entries) => {
  //       if(entries[0].isIntersecting && !isLoading) {
  //         setPaginationIndex((prev) => prev + 1);
  //       }  
  //     }, {threshold: 1});

  //   if(observerRef.current) {
  //     observer.observe(observerRef.current);
  //   }

  //   return () => {
  //     if(observerRef.current) {
  //       observer.unobserve(observerRef.current);
  //     }
  //   }
  // }, [isLoading]);


  const nextPage = () => {
    setPaginationIndex(paginationIndex + 1);
  }

  const prevPage = () => {
    if (paginationIndex == 0)
      return;
    else
      setPaginationIndex(paginationIndex - 1);
  }


  const filterHandler = async () => {
    const author = document.getElementById("author").value;
    if (document.getElementById("search").value !== '') {
      filter_search()
    }
    if (author === '') {
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

    if (isOfflineMode) {
      const operations = await getAllBooks();
      console.log(operations);
      if (operations.length > 0) {
        const filteredBooks = operations.map((operation) => operation.book).filter((book) => {
          return book.Title.toLowerCase().includes(search.toLowerCase());
        });
        setBooks(filteredBooks);
      }
      return;
    }


    if (document.getElementById("author").value !== '') {
      filter_search()
    }
    if (search === '') {
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

  const [timesClicked, setTimesClicked] = useState(0)

  const handleSort = async () => {
    const type = timesClicked % 2;
    setTimesClicked(timesClicked + 1)
    const url = type === 0
      ? `http://localhost:8800/books/page/${paginationIndex}/sort`
      : `http://localhost:8800/books/page/${paginationIndex}/sort/reverse`;


    if (isOfflineMode) {
      const operations = await getAllOperations();
      console.log(operations);
      if (operations.length > 0) {
        const sortedBooks = operations.map((operation) => operation.book).sort((a, b) => {
          return type === 0 ? a.Rating - b.Rating : b.Rating - a.Rating;
        });
        setBooks(sortedBooks);
      }
      return;
    }



    try {
      const res = await axios.get(`${url}`)
      setBooks(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }




  return (
    <>
      <div>
        <Title title="OnlyBooks" />
        <Navbar />
        <AddButton />
        <div className="sort-button">
          <button onClick={handleSort}>Sort by rating</button>
        </div>

        {isOfflineMode && (
          <div className="offline-banner">
            <p>You are currently in offline mode. Some features may be unavailable.</p>
          </div>
        )}

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
          <input className='input' id='author' type="text" placeholder="Author name" onKeyDown={(e) => { if (e.key.match('Enter')) filterHandler() }} />
        </div>

        <div className="content-container">
          {books.map((book, index) => {
            // console.log(book);
            if (index === books.length - 1) {
              return <Card key={book.id || `offline-${index}`} isOfflineMode={isOfflineMode} book={book} ref={lastBookElement}
                onDelete={(id) => setBooks(prev => prev.filter(b => b.id !== id))} />
            }
            else
              return <Card key={book.id || `offline-${index}`} book={book} />



          })}


        </div>

      </div>
    </>
  );
}

export default MainPage;