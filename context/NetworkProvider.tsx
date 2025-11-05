import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, { createContext, useContext, useEffect, useState } from "react";

type NetworkContextType = {
    isConnected: boolean;
    isInternetReachable: boolean | null;
};

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected ?? false);
            setIsInternetReachable(state.isInternetReachable ?? null);
        });

        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider value={{ isConnected, isInternetReachable }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
