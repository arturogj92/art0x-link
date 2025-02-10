// cron-local.js
import cron from "node-cron";

import fetch from "node-fetch";
// Configura la URL de tu endpoint local
const endpoint = 'http://localhost:3000/api/cron';

cron.schedule('*/30 * * * * * ', async () => {
    console.log('Ejecutando tarea cron local...');
    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        console.log('Cron local ejecutado:', data);
    } catch (error) {
        console.error('Error ejecutando cron local:', error);
    }
});
