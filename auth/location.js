import axios from "axios";

// Google Maps Geocoding API Key
const apiKey = "YOUR_GOOGLE_API_KEY";

// Reverse Geocoding function to get address details from latitude and longitude
export async function getLocationDetails(lat, lon) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lon}`,
          key: apiKey,
        },
      }
    );

    const results = response.data.results;

    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      let country = "";
      let state = "";
      let city = "";
      let area = "";

      // Loop through the address components and extract country, state, city, and area
      addressComponents.forEach((component) => {
        if (component.types.includes("country")) {
          country = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("sublocality")) {
          area = component.long_name;
        }
      });

      // Return country, state, city, and area
      return { country, state, city, area };
    } else {
      return { error: "No location details found." };
    }
  } catch (error) {
    return { error: "Error retrieving location data." };
  }
}
