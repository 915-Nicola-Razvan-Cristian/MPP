import React from 'react';
import './AddButton.css';
import { useNavigate } from 'react-router-dom';


export default function AddButton() {


    const navigate = useNavigate();

    const addButtonHandler = () => {
        navigate('/addform');
    }

    return (
        <div className="add-button-container"> 
            <button class="noselect" onClick={addButtonHandler}>
            <span class="text">Add a Book</span>
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
    )
}