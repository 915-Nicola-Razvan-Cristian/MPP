import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import BackButton from "../Components/BackButton/BackButton";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";


const UpdatePage = () => {


    const location = useLocation()
    const navigate = useNavigate()

    const updateButtonHandler = async () => {
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
        
            try {
                await axios.put(`http://localhost:8800/books/${location.pathname.split("/")[2]}`, newBook)
                alert('Book updated succesfully!')
                navigate('/')
            }
            catch (err) {
                console.log(err)
            }
        }
    }
    
        return (
            <>  
                <Navbar />
                <div className="add-form">
                    <h1>Update Book</h1>
                    <input id="title" type="text" placeholder="Title..." />
                    <input id="author" type="text" placeholder="Author..." />
                    <input id="cover" type="text" placeholder="*Cover..." />
                    <input id="desc" type="text" placeholder="*Description..." />
                    <input id="rating" type="number" placeholder="*Rating..." />
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