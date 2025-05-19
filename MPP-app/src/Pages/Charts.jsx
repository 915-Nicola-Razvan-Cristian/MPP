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
    const [genreStats, setGenreStats] = useState([])
    const [topAuthors, setTopAuthors] = useState([])
    const [priceDistribution, setPriceDistribution] = useState([])
    const [activeTab, setActiveTab] = useState('basic') // 'basic' or 'advanced'

    // Fetch basic book data
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/books`);
                setBooks(res.data)
            }
            catch (err) {
                console.log(err)
            }
        }
        fetchBooks()
    }, [])

    // Fetch statistical data from our new endpoints
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                // Fetch genre statistics
                console.log('Fetching genre statistics...');
                const genreRes = await axios.get('http://localhost:8800/stats/books/by-genre');
                console.log('Genre statistics response:', genreRes.data);
                setGenreStats(genreRes.data || []);
                
                // Fetch top authors
                console.log('Fetching top authors...');
                const authorsRes = await axios.get('http://localhost:8800/stats/authors/top-rated?minBooks=2&limit=10');
                console.log('Top authors response:', authorsRes.data);
                setTopAuthors(authorsRes.data || []);
                
                // Fetch price distribution
                console.log('Fetching price distribution...');
                const priceRes = await axios.get('http://localhost:8800/stats/books/price-distribution');
                console.log('Price distribution response:', priceRes.data);
                setPriceDistribution(priceRes.data || []);
            } catch (err) {
                console.error('Error fetching statistics:', err);
            }
        };
        
        fetchStatistics();
    }, []);

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
                setBooks(res.data);
                
                // Refresh statistics data when books are updated
                const genreRes = await axios.get('http://localhost:8800/stats/books/by-genre');
                setGenreStats(genreRes.data);
                
                const authorsRes = await axios.get('http://localhost:8800/stats/authors/top-rated?minBooks=2&limit=10');
                setTopAuthors(authorsRes.data);
                
                const priceRes = await axios.get('http://localhost:8800/stats/books/price-distribution');
                setPriceDistribution(priceRes.data);
            } catch (err) {
                console.log(err);
            }
        });

        // Handle initial data
        socket.on('initialData', (data) => {
            console.log('Received initial data:', data);
            setBooks(data);
        });

        // Cleanup function
        return () => {
            socket.disconnect();
        };
    }, []);

    // Basic Charts Data
    const ratingData = {
        labels: books.slice(0, 20).map(book => book.title), // Limit to 20 for readability
        datasets: [{
            label: 'Ratings',
            data: books.slice(0, 20).map(book => book.rating),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const priceData = {
        labels: books.slice(0, 20).map(book => book.title || `Book ${book.id}`),
        datasets: [{
            label: 'Prices',
            data: books.slice(0, 20).map(book => parseFloat(book.price)),
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

    // Statistical Charts Data
    const genreChartData = {
        labels: genreStats?.map(stat => stat?.primary_genre || 'Unknown') || [],
        datasets: [
            {
                label: 'Book Count',
                data: genreStats?.map(stat => stat?.book_count || 0) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Avg Rating',
                data: genreStats?.map(stat => parseFloat(stat?.avg_rating) || 0) || [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'rating'
            }
        ]
    };

    const topAuthorsChartData = {
        labels: topAuthors?.map(author => author?.name || 'Unknown') || [],
        datasets: [
            {
                label: 'Avg Rating',
                data: topAuthors?.map(author => parseFloat(author?.avg_rating) || 0) || [],
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
            {
                label: 'Book Count',
                data: topAuthors?.map(author => author?.book_count || 0) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'count'
            }
        ]
    };

    const priceRangeData = {
        labels: priceDistribution?.map(range => range?.price_range || 'Unknown') || [],
        datasets: [
            {
                label: 'Book Count',
                data: priceDistribution?.map(range => range?.book_count || 0) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            },
            {
                label: 'Avg Rating',
                data: priceDistribution?.map(range => parseFloat(range?.avg_rating) || 0) || [],
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                yAxisID: 'rating'
            }
        ]
    };

    return (
        <div className='dashboard'>
            <Title title="Book Analytics Dashboard" />
            
            <div className="tabs">
                <button 
                    className={activeTab === 'basic' ? 'active' : ''} 
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Charts
                </button>
                <button 
                    className={activeTab === 'advanced' ? 'active' : ''} 
                    onClick={() => setActiveTab('advanced')}
                >
                    Statistical Analysis
                </button>
                {activeTab === 'advanced' && (
                    <button 
                        className="refresh-button"
                        onClick={() => {
                            // Fetch statistics again
                            const fetchStatistics = async () => {
                                try {
                                    // Show loading state
                                    setGenreStats([]);
                                    setTopAuthors([]);
                                    setPriceDistribution([]);
                                    
                                    console.log('Refreshing genre statistics...');
                                    const genreRes = await axios.get('http://localhost:8800/stats/books/by-genre');
                                    console.log('Genre statistics response:', genreRes.data);
                                    setGenreStats(genreRes.data || []);
                                    
                                    console.log('Refreshing top authors...');
                                    const authorsRes = await axios.get('http://localhost:8800/stats/authors/top-rated?minBooks=1&limit=10');
                                    console.log('Top authors response:', authorsRes.data);
                                    setTopAuthors(authorsRes.data || []);
                                    
                                    console.log('Refreshing price distribution...');
                                    const priceRes = await axios.get('http://localhost:8800/stats/books/price-distribution');
                                    console.log('Price distribution response:', priceRes.data);
                                    setPriceDistribution(priceRes.data || []);
                                } catch (err) {
                                    console.error('Error refreshing statistics:', err);
                                }
                            };
                            fetchStatistics();
                        }}
                    >
                        Refresh Data
                    </button>
                )}
            </div>
            
            {activeTab === 'basic' && (
                <div className="charts-container">
                    <div className='chart' style={{ width: '45%', margin: '1rem auto' }}>
                        <h2>Book Ratings</h2>
                        <Bar data={ratingData} options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 10
                                }
                            }
                        }} />
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
                        <h2>Rating Distribution</h2>
                        <Pie 
                            data={ratingDistribution} 
                            options={{
                                maintainAspectRatio: true,
                                responsive: true
                            }}
                        />
                    </div>
                </div>
            )}
            
            {activeTab === 'advanced' && (
                <div className="charts-container">
                    {(!genreStats?.length && !topAuthors?.length && !priceDistribution?.length) ? (
                        <div className="no-data-message">
                            <h3>No statistical data available</h3>
                            <p>This could be due to:</p>
                            <ul>
                                <li>No books in the database yet</li>
                                <li>Database connection issues</li>
                                <li>Server is still processing the data</li>
                            </ul>
                            <button onClick={() => {
                                // Fetch statistics again
                                const fetchStatistics = async () => {
                                    try {
                                        console.log('Fetching genre statistics...');
                                        const genreRes = await axios.get('http://localhost:8800/stats/books/by-genre');
                                        console.log('Genre statistics response:', genreRes.data);
                                        setGenreStats(genreRes.data || []);
                                        
                                        console.log('Fetching top authors...');
                                        const authorsRes = await axios.get('http://localhost:8800/stats/authors/top-rated?minBooks=1&limit=10');
                                        console.log('Top authors response:', authorsRes.data);
                                        setTopAuthors(authorsRes.data || []);
                                        
                                        console.log('Fetching price distribution...');
                                        const priceRes = await axios.get('http://localhost:8800/stats/books/price-distribution');
                                        console.log('Price distribution response:', priceRes.data);
                                        setPriceDistribution(priceRes.data || []);
                                    } catch (err) {
                                        console.error('Error fetching statistics:', err);
                                    }
                                };
                                fetchStatistics();
                            }}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className='chart' style={{ width: '45%', margin: '1rem auto' }}>
                                <h2>Books by Genre</h2>
                                {genreStats?.length ? (
                                    <Bar 
                                        data={genreChartData} 
                                        options={{
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Book Count'
                                                    }
                                                },
                                                rating: {
                                                    beginAtZero: true,
                                                    position: 'right',
                                                    title: {
                                                        display: true,
                                                        text: 'Avg Rating'
                                                    },
                                                    max: 5
                                                }
                                            }
                                        }} 
                                    />
                                ) : (
                                    <p>Loading genre data...</p>
                                )}
                            </div>

                            <div className="chart" style={{ width: '45%', margin: '1rem auto' }}>
                                <h2>Top Authors by Rating</h2>
                                {topAuthors?.length ? (
                                    <Bar
                                        data={topAuthorsChartData}
                                        options={{
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Avg Rating'
                                                    },
                                                    max: 5
                                                },
                                                count: {
                                                    beginAtZero: true,
                                                    position: 'right',
                                                    title: {
                                                        display: true,
                                                        text: 'Book Count'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <p>Loading author data...</p>
                                )}
                            </div>

                            <div className='chart' style={{ width: '45%', margin: '1rem auto' }}>
                                <h2>Price Range Analysis</h2>
                                {priceDistribution?.length ? (
                                    <Bar 
                                        data={priceRangeData} 
                                        options={{
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Book Count'
                                                    }
                                                },
                                                rating: {
                                                    beginAtZero: true,
                                                    position: 'right',
                                                    title: {
                                                        display: true,
                                                        text: 'Avg Rating'
                                                    },
                                                    max: 5
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <p>Loading price data...</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}