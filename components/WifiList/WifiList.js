import React, { useEffect, useState } from 'react';

const WifiList = ({ isLoading }) => {
    const [wifiNetworks, setWifiNetworks] = useState([]);
    
    // Simulate fetching available networks
    useEffect(() => {
        if (!isLoading) {
            const mockNetworks = [
                { name: "Network 1", connected: false },
                { name: "Network 2", connected: true },
                { name: "Network 3", connected: false },
            ];
            setWifiNetworks(mockNetworks);
        }
    }, [isLoading]);

    const toggleNetwork = (network) => {
        setWifiNetworks(wifiNetworks.map(net => 
            net.name === network.name ? { ...net, connected: !net.connected } : net
        ));
    };

    return (
        <div className="wifi-list">
            {isLoading ? (
                <div className="loading">Loading Wi-Fi Networks...</div>
            ) : (
                <>
                    <h3>Available Networks</h3>
                    <ul>
                        {wifiNetworks.map((network, index) => (
                            <li key={index} onClick={() => toggleNetwork(network)}>
                                {network.name} {network.connected ? "(Connected)" : ""}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default WifiList;
