import axios from "axios";
import "./FileUpload.css";
import { useState, ChangeEvent } from "react";
import BackButton from "../Components/BackButton/BackButton";

export default function FileUpload() {


    const [uploadStatus, setUploadStatus] = useState("idle");
    const [file, setFile] = useState(null);

    async function handleUpload() {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        setUploadStatus("uploading");
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post("http://localhost:8800/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            setUploadStatus("success");
        }
        catch (error) {
            setUploadStatus("error");
        }
    }

    function handleFileChange(e) {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
        else {
            setFile(null);
        }
    }


    return <div className="file-upload-container">
        <input type="file" id="file-input" name="file" onChange={handleFileChange} />
        {file && (
            <div className="file-info">
                <p>File name: {file.name}</p>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p>Type: {file.type}</p>
            </div>
        )}

        {file && uploadStatus !== "uploading" && (
            <button className="upload-button" onClick={handleUpload}>Upload</button>
        )}

        {uploadStatus === "uploading" && (
            <p id="uploading">Uploading...</p>
        )}
        {uploadStatus === "success" && (
            <p id='success'>Upload successful!</p>
        )}
        {uploadStatus === "error" && (
            <p id='failed'>Upload failed. Please try again.</p>
        )}

        <BackButton></BackButton>
    </div>


}