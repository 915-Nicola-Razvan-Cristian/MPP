
import React from 'react'
import './Charts.css'
import Title from '../Components/Title/Title'


export default function Charts() {
    return (
        <div>
            <Title title="Charts" />
            <div className="charts-container">
                <div className="chart">
                    <h2>Chart 1</h2>
                </div>
                <div className="chart">
                    <h2>Chart 2</h2>
                </div>
                <div className="chart">
                    <h2>Chart 3</h2>
                </div>
                <div className="chart">
                    <h2>Chart 4</h2>
                </div>
            </div>
        </div>
            )
}