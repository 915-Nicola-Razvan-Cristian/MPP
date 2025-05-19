
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdatePage.css";

export default function UpdateAuthorPage({ isOfflineMode }) {
    const [author, setAuthor] = useState(null);
    const [name, setName] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchAuthor = async () => {
        try {
            const res = await axios.get(`http://localhost:8800/authors/${id}`);
            setAuthor(res.data);
            setName(res.data.name);
        } catch (err) {
            console.log(err);
        }
        };
        fetchAuthor();
    }, [id]);
    
    const handleUpdate = async () => {
        if (!name) {
        alert("Please enter the author name!");
        return;
        }
    
        try {
        await axios.put(`http://localhost:8800/authors/${id}`, { name });
        alert("Author updated successfully!");
        navigate("/authors");
        } catch (err) {
        console.log(err);
        }
    };
    
    return (
        <div className="update-author-page">
        <h1>Update Author</h1>
        <input
            type="text"
            placeholder={author ? author.name : "Loading..."}
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleUpdate}>Update Author</button>
        </div>
    );
    }