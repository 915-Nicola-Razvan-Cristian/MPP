import { useEffect, useState } from "react";

function useConnectivityStatus(API_URL) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [backendReachable, setBackendReachable] = useState(false);

    useEffect( () => {
       
        window.addEventListener("online", () => setIsOnline(true));
        window.addEventListener("offline", () => setIsOnline(false));

        const checkBackend = async () => {
            try {
                const response = await fetch(API_URL, { method: "HEAD" }, { timeout : 5000});
                setBackendReachable(response.ok);
            } catch (error) {
                setBackendReachable(false);
            }
        };
        checkBackend();

        const interval = setInterval(checkBackend, 5000); // Check every 5 seconds
        return () => {
            clearInterval(interval);
            window.removeEventListener("online", () => setIsOnline(true));
            window.removeEventListener("offline", () => setIsOnline(false));
        };


    }, [API_URL]);

    return {
        isOnline,
        backendReachable,
        isOfflineMode: !navigator.onLine || !backendReachable,
    };

}

export default useConnectivityStatus;