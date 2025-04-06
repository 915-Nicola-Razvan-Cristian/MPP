import React, { useState } from "react";
import BackButton from "../Components/BackButton/BackButton";
import "./AddForm.css";
import AddButton from "../Components/AddButton/AddButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import { saveBook } from "../utils/offlineStorage";




const AddForm = (props) => {


    let offlineID = 1; 

    const [book, setBook] = useState({
        title: "",
        author: "",
        desc: null,
        cover: null,
        rating: 0
    })

    const navigate = useNavigate()

    const addFormButtonHandler = async () => {
        if (document.getElementById('title').value === '' || document.getElementById('author').value === '' || document.getElementById('price').value === '') {
            alert('Please fill in the Title, Author and Price fields!');
            return;
        }



        if (!props.isOfflineMode) {
            const newBook = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                cover: document.getElementById('cover').value,
                desc: document.getElementById('desc').value,
                rating: document.getElementById('rating').value ? document.getElementById('rating').value : null,
                price: document.getElementById('price').value
            }
            setBook(newBook);
            try {
                await axios.post("http://localhost:8800/books", newBook)
                alert('Book added succesfully!')
                navigate('/')
            }
            catch (err) {
                console.log(err)
            }
        }
        else {
            const newBook = {
                id: offlineID++,
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                cover: document.getElementById('cover').value,
                desc: document.getElementById('desc').value,
                rating: document.getElementById('rating').value ? document.getElementById('rating').value : null,
                price: document.getElementById('price').value
            }
            console.log(newBook)
            saveBook(newBook)
            alert('Book added succesfully in offline mode!')
            navigate('/')
        }
    }
    // console.log(book)


    return (
        <div className="no-overflow">
            <Navbar />
            <div className="add-form">
                <h1>Add New Book</h1>
                <input id="title" type="text" placeholder="Title..." />
                <input id="author" type="text" placeholder="Author..." />
                <input id="price" type="number" placeholder="Price..." />
                <input id="cover" type="text" placeholder="*Cover..." />
                <input id="desc" type="text" placeholder="*Description..." />
                <input id="rating" type="number" placeholder="*Rating..." />

                <label>(* Optional)</label>
                <div className="add-button-container">
                    <button class="noselect" onClick={addFormButtonHandler}>
                        <span class="text">Add Book</span>
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
        </div>
    );
}

export default AddForm;