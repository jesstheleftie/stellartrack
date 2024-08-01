import React, { useState } from "react";
import "../VisibleTrackerBox/VisibleTracker.css";

const VisibleTracker = ({ setUserLocation }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [locationInfo, setLocationInfo] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_API;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxAccessToken}`
            );
            const data = await response.json();
            const place = data.features.find((feature) =>
              feature.place_type.includes("place")
            );
            const country = data.features.find((feature) =>
              feature.place_type.includes("country")
            );
            setLocationInfo(
              `Your current location is: ${
                place ? place.text : "Unknown City"
              }, ${
                country ? country.text : "Unknown Country"
              } (Latitude: ${latitude}, Longitude: ${longitude})`
            );
          } catch (error) {
            console.error("Error fetching location info:", error);
            setLocationInfo("Unable to retrieve location information.");
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to retrieve location.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      alert("Please enter valid latitude and longitude values.");
      return;
    }
    setUserLocation({ latitude: lat, longitude: lon });
    setLocationInfo(
      `Your inputted location is: (Latitude: ${lat}, Longitude: ${lon})`
    );
  };

  return (
    <div
      className="floating-div"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="inner-div">
        <h3>Visible Satellite Tracker</h3>
        {locationInfo ? (
          <p className="location-info">{locationInfo}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Latitude:
                  <input
                    type="text"
                    name="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Longitude:
                  <input
                    type="text"
                    name="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </label>
              </div>

              <button className="submit-button" type="submit">
                Submit
              </button>
            </form>
            <button onClick={handleUseLocation}>Use Your Location</button>
            {/* {locationInfo && <p className="location-info">{locationInfo}</p>} */}
          </>
        )}
      </div>
    </div>
  );
};

export default VisibleTracker;
