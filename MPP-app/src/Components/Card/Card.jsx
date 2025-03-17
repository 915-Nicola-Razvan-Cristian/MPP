import axios from 'axios'
import './Card.css'


export default function Card(props) {


    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8800/books/${id}`)
            window.location.reload()
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="card-container">
            <div className="card">
                {props.book.Cover && <img className='cover-img' src={props.book.Cover} alt="cover" />}
                <div className="card-title" >{props.book.Title}</div>
                <div className="card-content-container">
                    <div className="card-content" >{props.book.Author}</div>
                    <div className="card-content" >Rating: {props.book.Rating} / 10</div>
                </div>
            </div>
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

        </div>
    )
}