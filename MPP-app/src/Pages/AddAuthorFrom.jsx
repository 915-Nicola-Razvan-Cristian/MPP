import React, { useState } from 'react';
import axios from 'axios';

const AddAuthorForm = () => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!name) {
      alert('Please enter the author name!');
      return;
    }

    try {
      await axios.post('http://localhost:8800/authors', { name });
      alert('Author added successfully!');
      setName('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Add a New Author</h1>
      <form>
        <input
          type="text"
          placeholder="Author Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={handleSubmit}>
          Add Author
        </button>
      </form>
    </div>
  );
};

export default AddAuthorForm;