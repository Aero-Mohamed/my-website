<script setup>
import {onMounted, ref, watch, onBeforeUnmount} from 'vue'
import maplibregl from 'maplibre-gl'
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {ArcLayer, ScatterplotLayer} from '@deck.gl/layers';
import TrafficStatsPanel from "@/Pages/TrafficMap/Components/TrafficStatsPanel.vue";
import TrafficStatsStore from "@/Pages/TrafficMap/Components/TrafficStatsStore.js";

// Set up refs
const mapContainer = ref(null)
let map = null
let deckOverlay = null
let trafficBuffer = ref([]);

// Active traffic data that will be displayed
const activeTrafficData = ref([])

// Store unique server locations (will be displayed as blue points)
const serverLocations = ref([])

const colors = [
    [120, 176, 250],
    [163, 240, 173],
    [246, 250, 120]
];

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

    TrafficStatsStore.servers = serverLocations.value.length
}

// Function to simulate traffic coming in
const simulateTraffic = (trafficDataBatch) => {
    // Add a new random traffic data point
    if(Array.isArray(trafficDataBatch) && trafficDataBatch.length){

        trafficDataBatch.forEach((item) => {

            TrafficStatsStore.requests += 1;

            const existingIndex = activeTrafficData.value.findIndex(
                (data) => Array.isArray(data.client) &&
                    data.client[0] === item.client?.[0] &&
                    data.client[1] === item.client?.[1] &&
                    data.server_ip === item.server_ip
            )

            if (existingIndex !== -1) {
                let colorIdx = activeTrafficData.value[existingIndex].colorIdx;

                if (colorIdx + 1 > colors.length - 1) {
                    activeTrafficData.value[existingIndex].colorIdx = 0;
                } else {
                    activeTrafficData.value[existingIndex].colorIdx += 1;
                }

            }else{
                activeTrafficData.value.push({
                    ...item,
                    colorIdx: 0,
                    shouldChangeColor: true,
                    id: Date.now(),
                })
            }

            // Add server location to our server locations array
            addServerLocation(item.server_ip, item.server)
        })

        TrafficStatsStore.connections = activeTrafficData.value.length;

        // Update the deck overlay with new data
        if (deckOverlay) {
            updateDeckOverlay()
        }
    }
}

//Function to update the deck overlay with new data
const updateDeckOverlay = () => {
    if (!deckOverlay) return;

    // map.removeControl(deckOverlay)
    //
    // // Initialize deck.gl overlay with empty data
    // deckOverlay = new DeckOverlay({
    //     interleaved: true,
    //     layers: []
    // });
    //
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
                getSourceColor: d => colors[d.colorIdx],
                // getSourceColor: d => [251, 151, 84],
                getTargetColor: d => [248, 55, 104],
                getWidth: d => {
                    return 1.5;
                },
                // animationSpeed: 0.015,
                // trailLength: 0.3,
                // fadeOut: true,
                onComplete: () => {console.log('COmplate')}
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


    // map.addControl(deckOverlay);

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

        const ele = document.getElementsByClassName('maplibregl-control-container')
        while (ele.length > 0) {
            ele[0].parentNode.removeChild(ele[0]);
        }

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
        <TrafficStatsPanel/>
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
