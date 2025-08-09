const fetchAirPollution = async (lat, lon) => {
    const apiKey = 'd58b40cfbf5772a9e6f36982134cd818'; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Air Pollution Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching air pollution data:', error);
    }
};

// Example usage:
const latitude = 40.7128; // Replace with your desired latitude
const longitude = -74.0060; // Replace with your desired longitude
fetchAirPollution(latitude, longitude);
