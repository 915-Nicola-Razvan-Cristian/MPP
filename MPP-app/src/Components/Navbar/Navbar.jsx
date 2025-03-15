import React from 'react';
import './Navbar.css';

export default function Navbar()
{
    return (
        <div className="nav">
            <div className="container">
                <div className="btn">Home</div>
                <div className="btn">Contact</div>
                <div className="btn">About</div>
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