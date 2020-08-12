require('dotenv').config();
const port = process.env.PORT || 3000;

const express = require('express');
const request = require('superagent');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.static('public'));


const {
    GEOCODE_API_KEY,
    WEATHER_API_KEY

} = process.env;

 async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);
    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitute: city.lon
    };
 }

 app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
    
        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});






async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`);

    let data = response.body.data;

    data = data.slice(0, 8)

    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000)
        };
    });
    return forecastArray;
}

app.get('/weather', (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;
    
        const mungedData = getWeather(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}); 






app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
