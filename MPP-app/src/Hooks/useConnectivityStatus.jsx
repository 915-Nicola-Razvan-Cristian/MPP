import { useEffect, useState } from "react";

function useConnectivityStatus(baseURL) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [backendReachable, setBackendReachable] = useState(false);
    
    // Make sure we're using the status endpoint
    const statusURL = `${baseURL}status`;

    useEffect(() => {
        // Listen for online/offline browser events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        const checkBackend = async () => {
            try {
                // Use a proper timeout with AbortController
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                console.log('Checking backend connectivity at:', statusURL);
                const response = await fetch(statusURL, { 
                    method: "GET",
                    signal: controller.signal,
                    // Include credentials to make sure cookies are sent
                    credentials: 'include',
                    // Prevent caching
                    cache: 'no-cache',
                    headers: {
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    setBackendReachable(data.status === 'ok');
                    console.log('Backend connectivity check result:', data);
                } else {
                    console.log('Backend returned non-OK status:', response.status);
                    setBackendReachable(false);
                }
            } catch (error) {
                console.error('Backend connectivity check error:', error.message);
                setBackendReachable(false);
            }
        };

        // Check immediately
        checkBackend();

        // Set up interval to check periodically
        const interval = setInterval(checkBackend, 5000);
        
        // Clean up event listeners and interval on unmount
        return () => {
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [statusURL]);

    // Compute final offline mode state
    const isOfflineMode = !isOnline || !backendReachable;
    
    // Log the state for debugging
    useEffect(() => {
        console.log('Connectivity status:', {
            browserOnline: isOnline,
            backendReachable,
            isOfflineMode
        });
    }, [isOnline, backendReachable, isOfflineMode]);

    return {
        isOnline,
        backendReachable,
        isOfflineMode
    };
}

export default useConnectivityStatus;