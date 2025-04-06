import axios from "axios";
import { useEffect, useState } from "react";


function useGetBooks(pageNumber, isOfflineMode) {

    const [books, setBooks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState(false)



    useEffect(() => {
        if(isOfflineMode)
            return
        setIsLoading(true)
        setError(false)
        setHasMore(false)
        let cancel
        axios({
            method: 'get',
            url: `http://localhost:8800/books/page/${pageNumber}`,
            params: { page: pageNumber },
            cancelToken: new axios.CancelToken(c => cancel = c)
        }).then(res => {
            // console.log(res.data == books);
            console.log(res.data);
            // console.log(books)
            setBooks(prevBooks => {
                const newBooks = res.data.filter((newBook) => !prevBooks.some((oldBook) => 
                    oldBook.id === newBook.id));
                return [...prevBooks, ...newBooks];
            })
            setHasMore(res.data.length == 8)
            setIsLoading(false)
        }).catch(err => {
            if(axios.isCancel(err)) return
            console.log(err);
            setError(true)
        })
    }, [pageNumber, isOfflineMode])


    return { isLoading, error, books, hasMore, setBooks }

}

export default useGetBooks