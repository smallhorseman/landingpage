// Located in: /netlify/functions/get-flickr-album.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
    // Get the Album ID from the request URL, e.g., /.netlify/functions/get-flickr-album?album_id=12345
    const { album_id } = event.queryStringParameters;

    if (!album_id) {
        return { statusCode: 400, body: 'Album ID is required.' };
    }

    const { FLICKR_API_KEY, FLICKR_USER_ID } = process.env;
    const API_URL = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${FLICKR_API_KEY}&photoset_id=${album_id}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Transform the data into a simple array of image URLs
        const photoUrls = data.photoset.photo.map(photo => {
            // Construct the URL for a large-sized image (1024px on the long side)
            return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
        });

        return {
            statusCode: 200,
            body: JSON.stringify(photoUrls),
        };
    } catch (error) {
        console.error('Flickr API Error:', error);
        return {
            statusCode: 500,
            body: 'Error fetching photos from Flickr.',
        };
    }
};
