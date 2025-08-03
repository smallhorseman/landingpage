// Located in: /netlify/functions/get-random-logo.js

const fetch = require('node-fetch');

// This is the ID for your Flickr album that contains all the logos.
// We will set this in your Netlify environment variables for security.
const LOGO_ALBUM_ID = process.env.FLICKR_LOGO_ALBUM_ID;

exports.handler = async function(event) {
    const { FLICKR_API_KEY, FLICKR_USER_ID } = process.env;

    // Check if required environment variables are set
    if (!FLICKR_API_KEY || !FLICKR_USER_ID || !LOGO_ALBUM_ID) {
        console.error("Missing Flickr environment variables");
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error.' }),
        };
    }

    const API_URL = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${FLICKR_API_KEY}&photoset_id=${LOGO_ALBUM_ID}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Flickr API responded with status: ${response.status}`);
        }
        const data = await response.json();

        if (data.stat !== 'ok') {
            throw new Error(`Flickr API error: ${data.message}`);
        }

        // Transform the data into a simple array of image URLs
        const photoUrls = data.photoset.photo.map(photo => {
            // Construct the URL for a large-sized image (1024px)
            return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
        });
        
        if (photoUrls.length === 0) {
            throw new Error("No photos found in the Flickr album.");
        }

        // Pick one logo URL at random from the array
        const randomLogoUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];

        return {
            statusCode: 200,
            body: JSON.stringify({ logoUrl: randomLogoUrl }),
        };
    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message || 'Error fetching logos from Flickr.' }),
        };
    }
};
