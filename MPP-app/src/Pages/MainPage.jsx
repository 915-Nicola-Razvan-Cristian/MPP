import React from "react";
import Card from "../Components/Card/Card";
import Title from "../Components/Title/Title";
import Navbar from "../Components/Navbar/Navbar";
import AddButton from "../Components/AddButton/AddButton";

function MainPage() {
    return (
        <>
            <div>
              <Title/>
              <Navbar/>
              <AddButton/>
              <div className="content-container">
                <Card/>
                <Card/>
                <Card/>
              </div>
            </div>
        </>
    );
}

export default MainPage;