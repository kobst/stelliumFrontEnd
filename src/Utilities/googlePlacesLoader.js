import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

let placesLibraryPromise = null;

export async function loadPlacesLibrary() {
  if (!GOOGLE_API_KEY) {
    throw new Error('REACT_APP_GOOGLE_API_KEY is not configured');
  }

  if (!placesLibraryPromise) {
    const loader = new Loader({
      apiKey: GOOGLE_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    placesLibraryPromise = loader.load().then(async () => {
      if (!window.google?.maps?.importLibrary) {
        throw new Error('Google Maps JavaScript API failed to load');
      }

      return window.google.maps.importLibrary('places');
    });
  }

  return placesLibraryPromise;
}
