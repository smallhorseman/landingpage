// Located in: /netlify/functions/get-random-logo.js

const fetch = require('node-fetch');

// This is the ID for your Flickr album that contains all the logos.
// We will set this in your Netlify environment variables for security.
const LOGO_ALBUM_ID = process.env.FLICKR_LOGO_ALBUM_ID;

exports.handler = async function(event) {
    const { FLICKR_API_KEY, FLICKR_USER_ID } = process.env;
    const API_URL = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${FLICKR_API_KEY}&photoset_id=${LOGO_ALBUM_ID}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Transform the data into a simple array of image URLs
        const photoUrls = data.photoset.photo.map(photo => {
            // Construct the URL for a large-sized image (1024px)
            return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
        });
        
        // Pick one logo URL at random from the array
        const randomLogoUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];

        return {
            statusCode: 200,
            body: JSON.stringify({ logoUrl: randomLogoUrl }),
        };
    } catch (error) {
        console.error('Flickr API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching logos from Flickr.' }),
        };
    }
};
