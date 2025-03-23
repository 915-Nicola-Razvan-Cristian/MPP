import React from "react";
import "./Title.css";

export default function Title(props) {

    return (
        <div className="title-container">
            <h1 className="title">{props.title}</h1>
        </div>
    )
}