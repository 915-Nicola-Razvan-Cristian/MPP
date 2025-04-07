import React, { use } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar()
{

    const navigate = useNavigate();

    return (
        <div className="nav">
            <div className="container">
                <div className="btn" onClick={() => navigate("/")}>Home</div>
                <div className="btn" onClick={() => navigate("/uploads")}>Uploads</div>
                <div className="btn" onClick={() => navigate("/charts")}>Charts</div>
                <div className="btn">FAQ</div>
                <svg
                className="outline"
                overflow="visible"
                width="400"
                height="60"
                viewBox="0 0 400 60"
                xmlns="http://www.w3.org/2000/svg"
                >
                <rect
                    className="rect"
                    pathLength="100"
                    x="0"
                    y="0"
                    width="400"
                    height="60"
                    fill="transparent"
                    stroke-width="5"
                ></rect>
                </svg>
            </div>
        </div>

    );
}