import React, { useState } from "react";
import BackButton from "../Components/BackButton/BackButton";
import "./AddForm.css";
import AddButton from "../Components/AddButton/AddButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";





const AddForm = () => {


    const [book, setBook] = useState({
        title: "",
        author: "",
        desc: null,
        cover: null,
        rating: 0
    })

    const navigate = useNavigate()

    const addFormButtonHandler = async () => {
        if (document.getElementById('title').value === '' || document.getElementById('author').value === '') {
            alert('Please fill in the Title and Author fields!');
            return;
        }
        else {
            const newBook = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                cover: document.getElementById('cover').value,
                desc: document.getElementById('desc').value,
                rating: document.getElementById('rating').value ? document.getElementById('rating').value : null
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
    }
    console.log(book)


    return (
        <>  
            <Navbar />
            <div className="add-form">
                <h1>Add New Book</h1>
                <input id="title" type="text" placeholder="Title..." />
                <input id="author" type="text" placeholder="Author..." />
                <input id="cover" type="text" placeholder="*Cover..." />
                <input id="desc" type="text" placeholder="*Description..." />
                <input id="rating" type="number" placeholder="*Rating..." />
                <label>* Optional</label>
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
        </>
    );
}

export default AddForm;