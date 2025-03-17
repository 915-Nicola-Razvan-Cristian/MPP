import React from "react";

import Card from "../Card/Card";
import "./CardList.css";

const CardList = ({ data }) => {
  return (
    <div className="card-list">
      {data.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
}
