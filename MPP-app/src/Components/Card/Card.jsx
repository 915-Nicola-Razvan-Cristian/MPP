import axios from 'axios'
import './Card.css'
import { Link, useNavigate } from 'react-router-dom'
import { forwardRef, useEffect, useRef, useState } from 'react';
import { saveOperation, getAllOperations, clearOperations, getAllBooks, deleteBook } from "../../utils/offlineStorage";
import { useAuth } from '../../utils/AuthContext';

const Card = forwardRef((props, ref) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [addingToCollection, setAddingToCollection] = useState(false);

    const handleDelete = async (id) => {
        if (props.isOfflineMode) {
            deleteBook(id)
             alert("Book deleted. Changes will be synced when you are online.")
            props.onDelete(id)
             return
        }
        else {
            try {
                await axios.delete(`http://localhost:8800/books/${id}`)
                props.onDelete(id)
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const handleUpdate = async () => {
        navigate(`/update/` + props.book.id)
    }

    const handleAddToCollection = async () => {
        if (!isAuthenticated) {
            alert('Please log in to add books to your collection');
            navigate('/login');
            return;
        }

        try {
            setAddingToCollection(true);
            await axios.post(`http://localhost:8800/users/books/${props.book.id}`);
            alert('Book added to your collection!');
        } catch (err) {
            if (err.response && err.response.status === 409) {
                alert('This book is already in your collection');
            } else {
                console.error('Error adding book to collection:', err);
                alert('Failed to add book to collection. Please try again.');
            }
        } finally {
            setAddingToCollection(false);
        }
    };

    const ratingRef = useRef(null)

    useEffect(() => {
        const colorful = () => {
            if (props.book.rating >= 8) {
                ratingRef.current.style.color = 'gold'
            }
            else if (props.book.rating >= 5) {
                ratingRef.current.style.color = 'orange'
            }
            else {
                ratingRef.current.style.color = 'red'
            }
            if (!props.book.rating) {
                ratingRef.current.innerHTML = "Rating: N/A"
                ratingRef.current.style.color = 'grey'
            }
        }
        colorful()
    }, []
    )
    return (
        <div className="card-container" ref={ref}>
            <div className="card">
                <div className="cover-container">
                    <img 
                        className="cover-img" 
                        src={props.book.cover || '/placeholder-cover.jpg'} 
                        alt={props.book.title || 'Book cover'} 
                    />
                    <div className="fade-overlay"></div>
                </div>
                <div className="card-title">{props.book.title}</div>
                <div className="card-content-container">
                    <div className="card-content" id='author'>{props.book.author}</div>
                    <div className="card-content" id='rating' ref={ratingRef}>Rating: {props.book.rating} / 10</div>
                    <div className="card-content" id='price'>Price: {props.book.price}$</div>
                </div>
            </div>
            <div className='button-container'>
                <button aria-label="Delete item" className="delete-button" onClick={() => handleDelete(props.book.id)}>
                    <svg
                        className="trash-svg"
                        viewBox="0 -10 64 74"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g id="trash-can">
                            <rect
                                x="16"
                                y="24"
                                width="32"
                                height="30"
                                rx="3"
                                ry="3"
                                fill="#e74c3c"
                            ></rect>

                            <g transform-origin="12 18" id="lid-group">
                                <rect
                                    x="12"
                                    y="12"
                                    width="40"
                                    height="6"
                                    rx="2"
                                    ry="2"
                                    fill="#c0392b"
                                ></rect>
                                <rect
                                    x="26"
                                    y="8"
                                    width="12"
                                    height="4"
                                    rx="2"
                                    ry="2"
                                    fill="#c0392b"
                                ></rect>
                            </g>
                        </g>
                    </svg>
                </button>
                <button onClick={handleUpdate} className="edit-button">
                    <span className="lable">Edit</span>
                </button>
                {/* <Link to={`/media/${props.book.media}`} className='media-button'>Media</Link> */}
                <button 
                    onClick={handleAddToCollection} 
                    className='collection-button'
                    disabled={addingToCollection}
                >
                    {addingToCollection ? 'Adding...' : 'Add to Collection'}
                </button>
            </div>
            {/* <button className='edit-button'><Link to={`update/${props.book.id}`}>Edit</Link></button> */}
        </div>
    )
})

export default Card;