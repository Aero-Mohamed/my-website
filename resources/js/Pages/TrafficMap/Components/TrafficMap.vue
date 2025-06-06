<script setup>
import {onMounted, ref, watch, onBeforeUnmount} from 'vue'
import maplibregl from 'maplibre-gl'
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {AnimatedArcLayer} from "@/Pages/TrafficMap/Components/AnimatedArcLayer.js";
import {ArcLayer, ScatterplotLayer} from '@deck.gl/layers';

// Set up refs
const mapContainer = ref(null)
let map = null
let deckOverlay = null
let trafficSimulationInterval = null
let trafficBuffer = ref([]);

// Active traffic data that will be displayed
const activeTrafficData = ref([])

// Store unique server locations (will be displayed as blue points)
const serverLocations = ref([])

// Function to add a server location to the serverLocations array
// Only adds if the server_ip doesn't already exist in the array
const addServerLocation = (serverIp, location) => {
    // Check if this server IP already exists in our array
    const exists = serverLocations.value.some(server => server.server_ip === serverIp)
    if (!exists) {
        serverLocations.value.push({
            server_ip: serverIp,
            location: location,
            id: `server-${serverIp}`
        })
    }
}

// Function to simulate traffic coming in
const simulateTraffic = (trafficDataBatch) => {
    // Add a new random traffic data point
    if(Array.isArray(trafficDataBatch) && trafficDataBatch.length){
        trafficDataBatch.forEach((item) => {
            activeTrafficData.value.push({
                ...item,
                id: Date.now(),
            })

            // Add server location to our server locations array
            addServerLocation(item.server_ip, item.server)
        })

        // Update the deck overlay with new data
        if (deckOverlay) {
            updateDeckOverlay()
        }
    }
}

// Function to update the deck overlay with new data
const updateDeckOverlay = () => {
    if (!deckOverlay) return;

    deckOverlay.setProps({
        layers: [
            // Animated arcs for traffic
            new ArcLayer({
                id: `traffic-arc${Date.now()}`, // Unique ID to force update
                data: activeTrafficData.value,
                // getTarget: f => f.server,
                // getSource: d => d.client,
                // getColor: d => {
                //     return [251, 151, 84] // Orange for requests
                //
                // },
                getSourcePosition: d => d.client,
                getTargetPosition: d => d.server,
                getSourceColor: d => [251, 151, 84],
                getTargetColor: d => [248, 55, 104],
                getWidth: d => {
                    return 1;
                },
                // animationSpeed: 0.015,
                // trailLength: 0.3,
                // fadeOut: true,
                // onComplete: () => {
                //     // Since we can't access the specific data item here,
                //     // we'll remove the oldest item from the activeTrafficData array
                //     if (activeTrafficData.value.length > 0) {
                //         activeTrafficData.value.shift(); // Remove the oldest item
                //     }
                // }
            }),
            // Blue points for server locations
            new ScatterplotLayer({
                id: `server-locations${Date.now()}`,
                data: serverLocations.value,
                getPosition: d => d.location,
                getColor: [248, 55, 104], // Servers Color
                getRadius: 8,
                radiusMinPixels: 6,
                pickable: true,
                stroked: true,
                lineWidthMinPixels: 1,
                lineWidthScale: 1,
                getFillColor: [248, 55, 104], //  Servers Color
                getLineColor: [248, 55, 104], //  Servers Color
            })
        ]
    });

};

onMounted(() => {
    // Initialize the map
    map = new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=hOYEYgtEktOrlrHTOsHe',
        center: [0.45, 14.47],
        zoom: 2,
        pitch: 20,
        bearing: 0,
    });

    // Initialize deck.gl overlay with empty data
    deckOverlay = new DeckOverlay({
        interleaved: true,
        layers: []
    });

    // Set up map controls
    map.on('load', () => {
        map.addControl(deckOverlay);
        map.addControl(new maplibregl.NavigationControl());
    });

    Echo.channel(`application-traffic`)
        .listen('ApplicationTrafficBatchEvent', (e) => {
            if (e?.trafficDataBatch && Array.isArray(trafficBuffer.value)) {
                trafficBuffer.value.push(...e.trafficDataBatch);
            }
        });

    setInterval(() => {
        if (Array.isArray(trafficBuffer.value) && trafficBuffer.value.length > 0) {
            const batch = [...trafficBuffer.value];
            trafficBuffer.value = [];

            simulateTraffic(batch); // draw batched data
        }
    }, 2000); // tune this interval based on performance

});

// Clean up resources when component is unmounted
onBeforeUnmount(() => {

    // Remove the map
    if (map) {
        map.remove();
    }
});


</script>

<template>
    <div class="traffic-map-container">
        <div ref="mapContainer" class="map-container"></div>

    </div>
</template>

<style scoped>
.traffic-map-container {
    position: relative;
    width: 100%;
    height: 100vh;
}

.map-container {
    height: 100%;
    width: 100%;
}
</style>
