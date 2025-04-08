import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import './MediaPage.css';
import BackButton from "../Components/BackButton/BackButton";

export default function MediaPage() {
    const [loading, setLoading] = useState(true);

    const mediaName = useLocation().pathname.split("/")[2]

    useEffect(() => {
        async function fetchMedia() {
            try {
                const response = await axios.get(`http://localhost:8800/media/${mediaName}`);
                setMedia(response.data);
            } catch (error) {
                console.error("Error fetching media:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMedia();
    }, []);



    const isVideo = mediaName.endsWith(".mp4") || mediaName.endsWith(".avi") || mediaName.endsWith(".mkv");
    const isImage = mediaName.endsWith(".jpg") || mediaName.endsWith(".png") || mediaName.endsWith(".gif");





    if (loading) {
        return <div>Loading...</div>;
    }

    if (mediaName === "null") {
        return <p>No media available</p>
    }

    return (
        <div className="media-page">
            {isVideo ? (

                <div className="video-container">
                    <video controls width="700" src={`http://localhost:8800/media/${mediaName}`} type="video/mp4" />
                    <a className="download" href={`http://localhost:8800/media/${mediaName}`} download>Download</a>
                </div>
    ) : isImage ? (
        <div className="image-container">
            <img src={`http://localhost:8800/media/${mediaName}`} alt="Media" style={{ width: "100%", height: "100%" }} />
            <a className="download" href={`http://localhost:8800/media/${mediaName}`} download>Download</a>
        </div>
    ) : (
        <p>No media available</p>
    )
    }
    <BackButton/>
        </div>
    );
}