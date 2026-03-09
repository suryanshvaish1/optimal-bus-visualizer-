// Global variables
let map;
let allStops = []; // To store stop data
let routeLayer = null; // To store the route line

// 1. Initialize the map
function initMap() {
    map = L.map('map').setView([12.97, 77.59], 12); // Centered on Bengaluru
    //map = L.map('map').setView([40.715, -74.005], 15); // Centered on our stops

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    loadStops();
}

// 2. Load stops from JSON
async function loadStops() {
    try {
        const response = await fetch('stops.json');
        allStops = await response.json();

        const startSelect = document.getElementById('start-stop');
        const endSelect = document.getElementById('end-stop');

        allStops.forEach(stop => {
            // Add marker to map
            L.marker([stop.lat, stop.lng])
                .addTo(map)
                .bindPopup(stop.name);
            
            // Add to dropdowns
            const option1 = new Option(stop.name, stop.id);
            const option2 = new Option(stop.name, stop.id);
            startSelect.add(option1);
            endSelect.add(option2);
        });
    } catch (error) {
        console.error('Error loading stops:', error);
    }
}

// 3. Find Route function
async function findRoute() {
    const startId = document.getElementById('start-stop').value;
    const endId = document.getElementById('end-stop').value;

    if (!startId || !endId) {
        alert('Please select a start and end stop.');
        return;
    }

    if (startId === endId) {
        alert('Start and end stops cannot be the same.');
        return;
    }

    try {
        // Call our backend API
        const response = await fetch(`http://127.0.0.1:5000/api/get-route?start=${startId}&end=${endId}`);
        const path = await response.json(); // This will be ["stop_A", "stop_B", ...]

        if (response.ok) {
            drawRoute(path);
        } else {
            alert('Error: ' + path.error);
        }
    } catch (error) {
        console.error('Error fetching route:', error);
        alert('Could not connect to the backend server. Is it running?');
    }
}

// 4. Draw the route on the map
function drawRoute(path) {
    // Clear old route
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    // Get coordinates for each stop ID in the path
    const coordinates = path.map(stopId => {
        const stop = allStops.find(s => s.id === stopId);
        return [stop.lat, stop.lng];
    });

    // Create a polyline
    routeLayer = L.polyline(coordinates, { color: 'blue', weight: 5 });
    routeLayer.addTo(map);

    // Zoom the map to fit the route
    map.fitBounds(routeLayer.getBounds());
}

// --- Event Listeners ---

// Run initMap when the page is loaded
document.addEventListener('DOMContentLoaded', initMap);

// Run findRoute when the button is clicked
document.getElementById('find-route-btn').addEventListener('click', findRoute);
// Example for creating a custom icon in Leaflet
var startIcon = L.icon({
    iconUrl: 'images/start_icon.png',
    iconSize: [38, 95], // Example size
    iconAnchor: [22, 94] // Example anchor
});

// Then use it when creating a marker
L.marker([12.9755, 77.5721], {icon: startIcon}).addTo(map);