import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthorCard({ author, isOfflineMode }) {

  const navigate = useNavigate();

  const handleEdit = async () => {
    navigate(`/updateAuthor/${author.id}`);
  }

  const handleDelete = async () => {
    if (isOfflineMode) {
      // Handle offline deletion logic here
      alert("Offline mode: Author deleted locally.");
    } else {
      try {
        await axios.delete(`http://localhost:8800/authors/${author.id}`);
        alert("Author deleted successfully!");
        window.location.reload(); // Refresh the page to see the changes
      } catch (err) {
        console.log(err);
      }
    }
  };


  return (
    <div className="author-card">
      <h2>{author.name}</h2>
      {isOfflineMode && <p>Offline Mode</p>}
      <button onClick={handleEdit}>Edit Author</button>
      <button onClick={handleDelete}>Delete Author</button>

    </div>
  );
}