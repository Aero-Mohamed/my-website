import {reactive} from "vue";

const TrafficStatsStore = reactive({
    requests: 0,
    connections: 0,
    servers: 0,
});


export default TrafficStatsStore;
