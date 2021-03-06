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
    WEATHER_API_KEY,
    HIKING_API_KEY,
    YELP_API_KEY,

} = process.env;

 async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);
    const city = response.body[0];
    console.log('FIND THIS CONSOLE LOG', city);
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon
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
    console.log(lat, lon, WEATHER_API_KEY)
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`);

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

app.get('/weather', async (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;
    
        const mungedData = await getWeather(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}); 

async function getTrails(lat, long) {
    const trailData = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&key=${HIKING_API_KEY}`)
    const mungedTrailData = trailData.body.trails;
    return mungedTrailData;
}

app.get('/trails', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
        const response = await getTrails(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

async function getReviews(lat, long) {
    const reviewData = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${long}`).set('Authorization', `Bearer ${YELP_API_KEY}`);

    const mungedReviewlData = reviewData.body.businesses.map((review) => {
        return {
            "name": review.name,
            "image_url": review.image_url,
            "price": review.price,
            "rating": review.rating,
            "url": review.url,
        }
    });

    return mungedReviewlData;
}

app.get('/reviews', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
        const response = await getReviews(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/events', async(req, res) => {
    try {
        res.json([{
            link: 'www.gohere.com',
            name: 'Patricks Cool Event',
            event_date: '8/31/2020',
            summary: 'Cool Virtural Event!',
        }]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
