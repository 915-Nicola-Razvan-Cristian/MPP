
import React, { useEffect, useState } from 'react'
import './Charts.css'
import Title from '../Components/Title/Title'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Scale, SubTitle, Tooltip } from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

import axios from 'axios'
import io from 'socket.io-client' 


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    SubTitle,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);



export default function Charts() {


    const [books, setBooks] = useState([])
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/books`);
                console.log(res)
                setBooks(res.data)
            }
            catch (err) {
                console.log(err)
            }
        }
        fetchBooks()
    }, [])


    useEffect(() => {
        const socket = io('http://localhost:8800', {
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server!', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        socket.on('bookUpdate', async () => {
            try {
                const res = await axios.get(`http://localhost:8800/books`);
                console.log(res);
                setBooks(res.data);
            } catch (err) {
                console.log(err);
            }
        });

        // Handle initial data
        socket.on('initialData', (data) => {
            console.log('Received initial data:', data);
            setBooks(data);
        });

        // Cleanup function to disconnect socket
        
    }, []);


    const ratingData = {
        labels: books.map(book => book.title),
        datasets: [{
            label: 'Ratings',
            data: books.map(book => book.rating),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };


    const priceData = {
        labels: books.map(book => book.title || `Book ${book.id}`),
        datasets: [{
            label: 'Prices',
            data: books.map(book => parseFloat(book.price)),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y'
        }]
    };


    const ratingDistribution = {
        labels: ['1-3', '4-6', '7-8', '9-10'],
        datasets: [{
            data: [
                books.filter(book => {
                    const rating = book.rating;
                    return rating >= 1 && rating <= 3;
                }).length,
                books.filter(book => {
                    const rating = book.rating;
                    return rating >= 4 && rating <= 6;
                }).length,
                books.filter(book => {
                    const rating = book.rating;
                    return rating >= 7 && rating <= 8;
                }).length,
                books.filter(book => {
                    const rating = book.rating;
                    return rating >= 9 && rating <= 10;
                }).length,
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    };



    return (
        <div className='dashboard'>
            <Title title="Charts" />
            <div className="charts-container">
            <div className='chart' style={{ width: '45%', margin: '1rem auto' }}>
            <h2>Ratings</h2>
                <Bar data={ratingData} options={{
                scales: {
                    y: {
                    beginAtZero: true,
                    max: 10
                    }
                }
                }} ></Bar>
            </div>

            <div className="chart" style={{ width: '45%', margin: '1rem auto' }}>
                <h2>Book Prices</h2>
                <Line
                data={priceData}
                options={{
                    scales: {
                    y: {
                        beginAtZero: true
                    }
                    }
                }}
                />
            </div>


            <div className='chart' style={{ width: '45%', margin: '1rem auto' }}>
                <h2>Rating distribution</h2>
                <Pie 
                    data={ratingDistribution} 
                    options={{
                        maintainAspectRatio: true,
                        responsive: true
                    }}
                />
            </div>
            </div>
            {/* <BackButton /> */}
        </div>
        )
}