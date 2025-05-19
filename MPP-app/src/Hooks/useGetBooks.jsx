import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

function useGetBooks(pageNumber, isOfflineMode, pageSize = 8, isAdmin = false, showAll = false) {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Get total count for pagination
    useEffect(() => {
        if (isOfflineMode) return;
        
        axios.get('http://localhost:8800/books/count')
            .then(res => {
                setTotalCount(res.data.total);
            })
            .catch(err => {
                console.error("Error fetching book count:", err);
            });
    }, [isOfflineMode]);

    // Fetch books based on current page
    useEffect(() => {
        if (isOfflineMode) return;
        
        setIsLoading(true);
        setError(false);
        
        let cancel;
        
        // Determine which endpoint to use
        const endpoint = isAdmin && showAll 
            ? 'http://localhost:8800/books' 
            : `http://localhost:8800/books/page/${pageNumber}`;
        
        axios({
            method: 'get',
            url: endpoint,
            params: { 
                page: pageNumber,
                pageSize: pageSize 
            },
            cancelToken: new axios.CancelToken(c => cancel = c)
        }).then(res => {
            console.log("Fetched books:", res.data.length);
            
            // For pagination, replace books instead of appending
            setBooks(res.data);
            
            // Determine if there are more pages
            const maxPages = Math.ceil(totalCount / pageSize);
            setHasMore(pageNumber < maxPages - 1);
            
            setIsLoading(false);
        }).catch(err => {
            if (axios.isCancel(err)) return;
            console.error("Error fetching books:", err);
            setError(true);
            setIsLoading(false);
        });
        
        return () => cancel && cancel();
    }, [pageNumber, isOfflineMode, pageSize, isAdmin, showAll, totalCount]);

    return { 
        isLoading, 
        error, 
        books, 
        hasMore, 
        setBooks,
        totalCount
    };
}

export default useGetBooks;