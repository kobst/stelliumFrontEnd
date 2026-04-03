import React, { useEffect, useRef, useState } from 'react';
import { loadPlacesLibrary } from '../../Utilities/googlePlacesLoader';
import './GooglePlaceAutocomplete.css';

function getCoordinateValue(value, getterName) {
  if (value == null) {
    return null;
  }

  if (typeof value[getterName] === 'function') {
    return value[getterName]();
  }

  return value[getterName];
}

function GooglePlaceAutocomplete({
  className = '',
  style,
  placeholder = 'Search for a place...',
  loadingPlaceholder = 'Loading location search...',
  disabled = false,
  includedPrimaryTypes = ['(cities)'],
  includedRegionCodes,
  onPlaceSelected,
}) {
  const mountRef = useRef(null);
  const autocompleteRef = useRef(null);
  const listenerRef = useRef(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [status, setStatus] = useState('loading');
  const typesKey = includedPrimaryTypes?.join('|') || '';
  const regionKey = includedRegionCodes?.join('|') || '';

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.className = `google-place-autocomplete__element ${className}`.trim();

      if (style) {
        Object.assign(autocompleteRef.current.style, style);
      }
    }
  }, [className, style]);

  useEffect(() => {
    let cancelled = false;
    const mountNode = mountRef.current;
    const primaryTypes = typesKey ? typesKey.split('|') : [];
    const regionCodes = regionKey ? regionKey.split('|') : [];

    async function initializeAutocomplete() {
      try {
        const placesLibrary = await loadPlacesLibrary();
        if (cancelled || !mountNode) {
          return;
        }

        const PlaceAutocompleteElement =
          placesLibrary?.PlaceAutocompleteElement || window.google?.maps?.places?.PlaceAutocompleteElement;

        if (!PlaceAutocompleteElement) {
          throw new Error('PlaceAutocompleteElement is not available in the loaded Google Places library');
        }

        const autocompleteElement = new PlaceAutocompleteElement({});
        autocompleteElement.placeholder = placeholder;

        if (primaryTypes.length) {
          autocompleteElement.includedPrimaryTypes = primaryTypes;
        }

        if (regionCodes.length) {
          autocompleteElement.includedRegionCodes = regionCodes;
        }

        const handlePlaceSelection = async (event) => {
          try {
            const placePrediction = event?.placePrediction;
            if (!placePrediction) {
              throw new Error('No place prediction returned from Google Places');
            }

            const place = placePrediction.toPlace();
            await place.fetchFields({
              fields: ['displayName', 'formattedAddress', 'location'],
            });

            const lat = getCoordinateValue(place.location, 'lat');
            const lon = getCoordinateValue(place.location, 'lng');

            onPlaceSelectedRef.current?.({
              displayName: place.displayName || '',
              formattedAddress: place.formattedAddress || place.displayName || '',
              lat,
              lon,
              place,
            });
          } catch (error) {
            console.error('Error processing Google Place autocomplete selection:', error);
          }
        };

        mountNode.replaceChildren(autocompleteElement);
        autocompleteElement.addEventListener('gmp-select', handlePlaceSelection);
        autocompleteRef.current = autocompleteElement;
        listenerRef.current = handlePlaceSelection;
        setStatus('ready');
      } catch (error) {
        console.error('Error loading Google Places autocomplete:', error);
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    initializeAutocomplete();

    return () => {
      cancelled = true;

      if (autocompleteRef.current && listenerRef.current) {
        autocompleteRef.current.removeEventListener('gmp-select', listenerRef.current);
      }

      if (mountNode) {
        mountNode.replaceChildren();
      }

      autocompleteRef.current = null;
      listenerRef.current = null;
    };
  }, [placeholder, regionKey, typesKey]);

  return (
    <div className={`google-place-autocomplete ${disabled ? 'google-place-autocomplete--disabled' : ''}`}>
      <div
        ref={mountRef}
        className={`google-place-autocomplete__mount ${status === 'ready' ? 'google-place-autocomplete__mount--ready' : ''}`}
      />
      {status !== 'ready' && (
        <input
          type="text"
          className={`google-place-autocomplete__fallback ${className}`.trim()}
          style={style}
          placeholder={status === 'error' ? 'Location search unavailable' : loadingPlaceholder}
          disabled
        />
      )}
      {disabled && <div className="google-place-autocomplete__disabled-mask" aria-hidden="true" />}
    </div>
  );
}

export default GooglePlaceAutocomplete;
