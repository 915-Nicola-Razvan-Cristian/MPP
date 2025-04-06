import axios from 'axios'
import './Card.css'
import { Link, useNavigate } from 'react-router-dom'
import { forwardRef, useEffect, useRef } from 'react';
import { saveOperation, getAllOperations, clearOperations, getAllBooks, deleteBook } from "../../utils/offlineStorage";


const Card = forwardRef((props, ref) => {


    const navigate = useNavigate();

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
                {props.book.Cover && <img className='cover-img' src={props.book.cover} alt="cover" />}
                <div className="card-title" >{props.book.title}</div>
                <div className="card-content-container">
                    <div className="card-content" id='author'>{props.book.author}</div>
                    <div className="card-content" id='rating' ref={ratingRef}>Rating: {props.book.rating} / 10</div>
                    <div className="card-content" id='price' >Price: {props.book.price}$</div>
                </div>
            </div>
            <div className='button-container'>
                <button aria-label="Delete item" class="delete-button" onClick={() => handleDelete(props.book.id)}>
                    <svg
                        class="trash-svg"
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
                <button onClick={handleUpdate} class="edit-button">
                    <span class="lable">Edit</span>
                </button>
            </div>
            {/* <button className='edit-button'><Link to={`update/${props.book.id}`}>Edit</Link></button> */}
        </div>
    )
})

export default Card;