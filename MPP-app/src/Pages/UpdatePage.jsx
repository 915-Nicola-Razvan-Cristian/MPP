import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import BackButton from "../Components/BackButton/BackButton";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './UpdatePage.css';

const UpdatePage = () => {

    
    const location = useLocation()
    const navigate = useNavigate()

    const [book, setBook] = useState(null)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/books/${location.pathname.split("/")[2]}`)
                setBook(res.data)   
                console.log(res.data)
            }
            catch (err) {
                console.log(err)
            }
        }
        fetchBook()
    }, [location.pathname])




    const updateButtonHandler = async () => {
        // if (document.getElementById('title').value === '' || document.getElementById('author').value === '' || document.getElementById('price').value === '') {
        //     alert('Please fill in the Title, Author and Price fields!');
        //     return;
        // }
        // else {
            const newBook = { ...book[0] };
            console.log(newBook)
            const fields = ['title', 'author', 'cover', 'desc', 'rating', 'price'];
            fields.forEach(field => {
                const value = document.getElementById(field).value;
                if (value !== '' && value !== null) {
                    newBook[field] = value;
                }
            });

            console.log(newBook)
        
            try {
                await axios.put(`http://localhost:8800/books/${location.pathname.split("/")[2]}`, newBook)
                alert('Book updated succesfully!')
                navigate('/')
            }
            catch (err) {
                console.log(err)
            }
        // }
    }

    if (!book) {
        return <div>Loading...</div>;
    }
    else
        return (
            <>  
                <Navbar />
                <div className="add-form">
                    <h1>Update Book</h1>
                    <form>
                    <label>Title: </label><label>Author: </label><input id="title" type="text" placeholder={book[0].Title} />
                    <label>Author: </label><input id="author" type="text" placeholder={book[0].Author} />
                    <label>Price: </label><input id="price" type="number" placeholder={book[0].Price} />
                    <label>Cover: </label><input id="cover" type="text" placeholder="*Cover..."   />
                    <label>Description: </label><input id="desc" type="text" placeholder="*Description..." />
                    <label>Rating: </label><input id="rating" type="number" placeholder="*Rating..." />
                    </form>
                    <label>* Optional</label>
                    <div className="add-button-container">
                        <button class="noselect" onClick={() => updateButtonHandler()}>
                            <span class="text">Update Book</span>
                            <span class="icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    height="24"
                                    width="24"
                                    xmlns="http://www.w3.org/2000/svg"></svg>
                                <span class="buttonSpan">+</span>
                            </span>
                        </button>
                    </div>
                    <BackButton />
                </div>
            </>)
}

export default UpdatePage;