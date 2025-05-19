import React from 'react';
import './AddButton.css';
import { useNavigate } from 'react-router-dom';

export default function AddButton() {
    const navigate = useNavigate();

    const addButtonHandler = () => {
        navigate('/addform');
    }

    return (
        <div className="add-button-container" id='add-button-container'> 
            <button className='button' onClick={addButtonHandler}>
                <span className="text">Add a Book</span>
                <span className="icon">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="24" 
                        height="24"
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </span>
            </button>
        </div>
    )
}