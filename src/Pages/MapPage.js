import Map, { useControl } from "react-map-gl";
import ControlPanel from "./ControlPanel/ControlPanel";
import mapboxgl from "mapbox-gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import { IconLayer } from "deck.gl";
import DeckGL from "deck.gl";
import { PointCloudLayer } from "@deck.gl/layers";
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from "satellite.js";
import React, { useEffect, useState, useRef } from "react";
import VisibleTracker from "./VisibleTrackerBox/VisibleTracker";
import "../Pages/MapPage.css";
import "mapbox-gl/dist/mapbox-gl.css";
import {calculateDistance, isSatelliteWithinRadius} from "../Pages/utils/utils";

const MapPage = () => {
  const INITIAL_VIEW_STATE = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 1,
    pitch: 0,
    bearing: 0,
  };
  const earthRadius = 6.3e6;

  function getAltitude(zoomLevel) {
    const tileSize = 256; // Tile size in pixels at zoom level 0
    const initialResolution = (2 * Math.PI * earthRadius) / tileSize; // Resolution at zoom level 0

    // Calculate altitude (scale) based on zoom level
    const altitude = initialResolution / Math.pow(2, zoomLevel);

    return altitude;
  }

  const urls = {
    starlink: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
      size: 1,
      title: "Starlink",
      color: [255, 0, 0], //Red
    },
    ISS: {
      url: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
      size: 5,
      title: "ISS",
      color: [0, 255, 0], // Green
    },
    galileo: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=tle",
      size: 5,
      title: "Galileo",
      color: [0, 0, 255], // Blue
    },
    hubble: {
      url: "https://celestrak.org/NORAD/elements/gp.php?INTDES=1990-037",
      size: 5,
      title: "Hubble",
      color: [255, 255, 0], // Yellow
    },
    beidou: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle",
      size: 5,
      title: "Beidou",
      color: [255, 165, 0], // Orange
    },
    iridium: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium&FORMAT=tle",
      size: 5,
      title: "Iridium",
      color: [128, 0, 128], // Purple
    },
    last30DayLaunch: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=tle",
      size: 3,
      title: "Last 30 Day Launch",
      color: [0, 255, 255], // Cyan
    },
    oneHundredBrightest: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle",
      size: 3,
      title: "100 Brightest",
      color: [255, 105, 180], // Pink
    },
    spire: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=spire&FORMAT=tle",
      size: 5,
      title: "Spire",
      color: [0, 128, 0], // Dark Green
    },
    spaceStation: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle",
      size: 3,
      title: "Space Station",
      color: [75, 0, 130], //Indigo
    },
    activeSatellites: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle",
      size: 3,
      title: "Active Satellites",
      color: [0, 255, 0], //Lime
    },
    analystSatellites: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=analyst&FORMAT=tle",
      size: 3,
      title: "Analyst Satellites",
      color: [0, 128, 128], //Teal
    },
    RussianASATTestDebris: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=tle",
      size: 3,
      title: "Russian ASAT Test Debris",
      color: [128, 0, 0], //Maroon
    },
    ChineseASATTestDebris: {
      url: "https://celestrak.org/NORAD/elements/index.php?FORMAT=tle",
      size: 3,
      title: "Chinese ASAT Test Debris",
      color: [165, 42, 42], //Brown
    },
    Iridium33Debris: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle",
      size: 3,
      title: "Iridium 33 Deris",
      color: [250, 128, 114], //Salmon
    },
    Cosmos2251Debris: {
      url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle",
      size: 3,
      title: "Cosmos 2251 Debris",
      color: [128, 128, 0], //Olive
    },

  Weather: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle",
    size: 3,
    title: "Weather",
    color: [0, 0, 128], //Navy
  },

  NOAA: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=tle",
    size: 3,
    title: "NOAA",
    color: [192, 192, 192], //Silver
  },

  GOES: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=goes&FORMAT=tle",
    size: 3,
    title: "GOES",
    color: [139, 0, 139], //Dark Magenta 
  },

  EarthResources: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle",
    size: 3,
    title: "Earth Resources",
    color: [210, 105, 30], //Chocolate
  },

  SARSAT: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=sarsat&FORMAT=tle",
    size: 3,
    title: "Search & Rescue",
    color: [65, 105, 225], //Royal Blue
  },

  DisasterMonitoring: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=dmc&FORMAT=tle",
    size: 3,
    title: "Diaster Monitoring",
    color: [0, 139, 139], //Dark Cyan
  },

  TDRSS: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=tdrss&FORMAT=tle",
    size: 3,
    title: "TDRSS",
    color: [220, 20, 60], //Crimson
  },

  ARGOS: {
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=argos&FORMAT=tle",
    size: 3,
    title: "ARGOS",
    color: [186, 85, 211], //Medium Orchid
  },

  Planet: {
    urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=planet&FORMAT=tle",
    size: 3,
    title: "Planet",
    color: [32, 178, 170], //Light Sea Green
  },

  ActiveGeosynchronous: {
    urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle",
    size: 3,
    title: "Active Geosynchronous",
    color: [255, 127, 80], //Coral
  },

  GEOProtectedZone: {
    urls: "https://celestrak.org/NORAD/elements/gp.php?SPECIAL=gpz&FORMAT=tle",
    size: 3,
    title: "GEOProtectedZone",
    color: [72, 61, 139], //Dark Slate Blue
  },

  GEOProtectedZonePlus: {
    urls: "https://celestrak.org/NORAD/elements/gp.php?SPECIAL=gpz-plus&FORMAT=tle",
    size: 3,
    title: "GEO Protected Zone Plus",
    color: [255, 20, 147], //Deep Pink
  },

  Intelsat: {
    urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=intelsat&FORMAT=tle",
    size: 3,
    title: "Intelsat",
    color: [255, 140, 0], //Dark Orange
  },

SES: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=ses&FORMAT=tle",
  size: 3,
  title: "SES",
  color: [144, 238, 144], //Light Green
},
IridiumNEXT: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-NEXT&FORMAT=tle",
  size: 3,
  title: "Iridum NEXT",
  color: [255, 99, 71], //Tomato
},
OneWeb: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=tle",
  size: 3,
  title: "OneWeb",
  color: [240, 230, 140], //Khaki
},
Orbcomm: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=orbcomm&FORMAT=tle",
  size: 3,
  title: "Orbcomm",
  color: [85, 107, 47], //Dark Olive Green
},
Globalstar: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=globalstar&FORMAT=tle",
  size: 3,
  title: "Globalstar",
  color: [72, 209, 204], //Medium Turquoise
},
Swarm: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=swarm&FORMAT=tle",
  size: 3,
  title: "Swarm",
  color: [106, 90, 205], //Slate Blue
},
AmateurRadio: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle",
  size: 3,
  title: "AmateurRadio",
  color: [255, 105, 180], //Hot Pink
},
ExperimentalComm: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=x-comm&FORMAT=tle",
  size: 3,
  title: "Experimental Comm",
  color: [107, 142, 35], //Olive Drab
},
OtherComm: {
urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=other-comm&FORMAT=tle",
size: 3,
title: "Other Comms",
color: [255, 218, 185], //Peach Puff
},
SatNOGS: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=satnogs&FORMAT=tle",
  size: 3,
  title: "Sat NOGS",
  color: [188, 143, 143], //Rosy Brown
},
Gorizont: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=gorizont&FORMAT=tle",
  size: 3,
  title: "Gorizont",
  color: [70, 130, 180], //Steel Blue
},
Raduga: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=raduga&FORMAT=tle",
  size: 3,
  title: "Raduga",
  color: [46, 139, 87], //Sea Green
},
Molniya: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=molniya&FORMAT=tle",
  size: 3,
  title: "Molniya",
  color: [240, 128, 128], //Light Coral
},
GNSS: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle",
  size: 3,
  title: "GNSS",
  color: [205, 133, 63], //Peru
},
GPSOperational: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle",
  size: 3,
  title: "GPS Operational",
  color: [119, 136, 153], //Light Slate Gray
},
GLONASSOperational: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=glo-ops&FORMAT=tle",
  size: 3,
  title: "GLONASS Operational",
  color: [60, 179, 113], //Medium Sea Green
},
SatelliteBasedAugmentationSystem: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=sbas&FORMAT=tle",
  size: 3,
  title: "Satellite Based Augmentation System",
  color: [244, 164, 96], //Sandy Brown
},
NavyNavigationSatelliteSystem: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=nnss&FORMAT=tle",
  size: 3,
  title: "Navy Navigation Satellite System",
  color: [0, 206, 209], //Dark Turquoise
},
RussianLEONavigation: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=musson&FORMAT=tle",
  size: 3,
  title: "Russian LEO Navigation",
  color: [219, 112, 147], //Pale Violet Red
},
SpaceAndEarthScience: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle",
  size: 3,
  title: "Space & Earth Science",
  color: [34, 139, 34], // Forest Green
},
Geodetic: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=geodetic&FORMAT=tle",
  size: 3,
  title: "Geodetic",
  color: [100, 149, 237], //Corn Flower Blue
},
Engineering: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=engineering&FORMAT=tle",
  size: 3,
  title: "Engineering",
  color: [160, 82, 45], //Sienna
},
Education: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=education&FORMAT=tle",
  size: 3, 
  title: "Education",
  color: [102, 205, 170], //Medium Aqua Marine
},
MiscellaneousMilitary: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=military&FORMAT=tle",
  size: 3,
  title: "Miscellaneous Military",
  color: [205, 92, 92], //Indian Red
},
RadarCalibration: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=radar&FORMAT=tle",
  size: 3,
  title: "Radar Calibration",
  color: [178, 34, 34], //Fire Brick
},
CubeSats: {
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=tle",
  size: 3,
  title: "Cube Sats",
  color: [135, 206, 250], //Light Sky Blue
},
OtherSatellites:{
  urls: "https://celestrak.org/NORAD/elements/gp.php?GROUP=other&FORMAT=tle",
  size: 3,
  title: "Other Satellites",
  color: [0, 255, 127], //Spring Green
},
    
  };
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(Object.keys(urls)[0]);
  const [watchList, setWatchList] = useState([]);
  const [visibleGroups, setVisibleGroups] = useState([]);
  const [satelliteData, setSatelliteData] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationPixel, setUserLocationPixel] = useState([0, 0]);
  const mapInstance = useRef(null);

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };
  //API Part

  const fetchSatelliteData = async (group) => {
    try {
      const response = await fetch(urls[group].url);
      const textData = await response.text();
      const parsedData = parseTLEData(textData);
      setSatelliteData((prevData) => ({ ...prevData, [group]: parsedData }));
    } catch (error) {
      console.error(`Error fetching satellite data for ${group}:`, error);
    }
  };

  const parseTLEData = (data) => {
    const lines = data.trim().split("\n");
    const satellites = [];
    for (let i = 0; i < lines.length; i += 3) {
      satellites.push({
        name: lines[i].trim(),
        TLE_LINE1: lines[i + 1].trim(),
        TLE_LINE2: lines[i + 2].trim(),
      });
    }
    return satellites;
  };

  useEffect(() => {
    visibleGroups.forEach((group) => {
      if (!satelliteData[group]) {
        fetchSatelliteData(group);
      }
    });
  }, [visibleGroups]);

  const calculateSatellitePosition = (tleLine1, tleLine2) => {
    try {
      const satrec = twoline2satrec(tleLine1, tleLine2);
      const positionAndVelocity = propagate(satrec, new Date());
      const positionEci = positionAndVelocity.position;

      if (!positionEci) {
        console.error(
          "Position ECI is undefined. Check the TLE lines and propagation calculation."
        );
        return [0, 0, 0];
      }
      const gmst = gstime(new Date());
      const positionGd = eciToGeodetic(positionEci, gmst);

      const longitude = degreesLong(positionGd.longitude);
      const latitude = degreesLat(positionGd.latitude);
      const altitude = positionGd.height * 10000; // Convert km to meters

      return [longitude, latitude, altitude];
    } catch (error) {
      console.error("Error calculating satellite position:", error);
      return [0, 0, 0];
    }
  };
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setUserLocation({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //         });
  //       },
  //       (error) => console.error("Error fetching user location:", error),
  //       { enableHighAccuracy: true, timeout: 5000 }
  //     );
  //   }
  // }, []);

  useEffect(() => {
    if (userLocation && mapInstance.current) {
      const pixelPosition = mapInstance.current.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      setUserLocationPixel([pixelPosition.x, pixelPosition.y]);
      console.log("Pixel Position:", pixelPosition.x, pixelPosition.y); // Debugging
    }
  }, [userLocation, mapInstance.current]);

  // let mapInstance = null;

  const handleMapLoad = (event) => {
    mapInstance.current = event.target; // Save the map instance
    console.log("Map Loaded, Map Instance Set", mapInstance.current); // Add this line for debugging
    if (userLocation) {
      const pixelPosition = mapInstance.current.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      setUserLocationPixel([pixelPosition.x, pixelPosition.y]);
      console.log("Pixel Position on Load:", pixelPosition.x, pixelPosition.y); // Debugging
    }
  };
  // const renderSatelliteLayers = () => {
  //   return visibleGroups.map((group) => {
  //     if (!satelliteData[group]) return null;

  //     const data = satelliteData[group].map((satellite) => {
  //       const [longitude, latitude, altitude] = calculateSatellitePosition(
  //         satellite.TLE_LINE1,
  //         satellite.TLE_LINE2
  //       );
  //       return {
  //         position: [longitude, latitude, altitude],
  //         color: urls[group].color,
  //       };
  //     });
  // converting satellite data into Deck.gl-compatible format

  const isSatelliteWithinRadius = (satellitePosition, userLocation, radiusKm) => {
    const [satLon, satLat] = satellitePosition;
    const { latitude, longitude } = userLocation;
    const distance = calculateDistance(latitude, longitude, satLat, satLon);
    return distance <= radiusKm;
  };

  const handleViewStateChange = ({ viewState }) => {
    if (userLocation && mapInstance.current) {
      const pixelPosition = mapInstance.current.project([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      setUserLocationPixel([pixelPosition.x, pixelPosition.y]);
    }
  };

  const createLayers = () => {
    // Define the layers array
    const layers = visibleGroups.map((group) => {
      const data = (satelliteData[group] || [])
        .map((satellite) => {
          const position = calculateSatellitePosition(
            satellite.TLE_LINE1,
            satellite.TLE_LINE2
          );

          if (!position) {
            console.error(`Invalid position for satellite: ${satellite.name}`);
            return null; // Skip invalid positions
          }

          if (userLocation) {
            if (!isSatelliteWithinRadius(position, userLocation, 1000)) { // 1000 km radius
              return null; // Skip satellites outside the radius
            }
          }
          const [longitude, latitude, altitude] = position;

          return {
            position: [longitude, latitude, altitude],
            size: urls[group].size || 1,
            color: urls[group].color || [255, 255, 255], // Default to white if no color is defined
            elevation: 1000,
          };
        })
        .filter(Boolean);

      return new PointCloudLayer({
        id: `${group}-layer`,
        data,
        pickable: true,
        getPosition: (d) => d.position,
        getRadius: (d) => d.size,
        pointSize: urls[group].size || 1,
        getColor: (d) => d.color,
        getElevation: (d) => d.elevation,
        elevationScale: 1,
      });
    });

    if (userLocation) {
      console.log("User location:", userLocation);
      layers.push(
        new ScatterplotLayer({
          // id: "user-location",
          data: [userLocation],
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: 100, // Radius in meters
          getColor: [0, 0, 255], // Blue color for the dot
          radiusMinPixels: 5, // Minimum radius in pixels
          radiusMaxPixels: 40, // Maximum radius in pixels
        })
      );
    } else {
      console.log("User location not available.");
    }
    return layers;
  };
  console.log("getMarker", createLayers());
  return (
    <div>
      <ControlPanel
        urls={urls}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        satelliteData={satelliteData}
        isPopupVisible={isPopupVisible}
        togglePopup={() => setPopupVisible(!isPopupVisible)}
        watchList={watchList}
        setWatchList={setWatchList}
        visibleGroups={visibleGroups}
        setVisibleGroups={setVisibleGroups}
      />

      <DeckGL
        style={{ height: "100vh", width: "100vw", position: "fixed" }}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={createLayers()}
        onViewStateChange={handleViewStateChange}

        // layers={[pointCloudLayer]}
        // onViewStateChange={(data) =>
        //   console.log(getAltitude(data.viewState.zoom))
        // }
      >
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_API}
          mapStyle={"mapbox://styles/mapbox/dark-v11"}
          projection="mercator"
          maxBounds={[
            [-180, -90], // Southwest coordinates
            [180, 90], // Northeast coordinates
          ]}
          // onLoad={handleMapLoad}
          // When the map loads, ensure the user location is updated
        />
        {/* {userLocation && (
          <div
            style={{
              position: "absolute",
              top: `${userLocationPixel[1] - 10}px`, // Adjust for centering
              left: `${userLocationPixel[0] - 10}px`, // Adjust for centering
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 255, 0.7)",
              boxShadow: "0 0 15px 5px rgba(0, 0, 255, 0.5)",
              transform: "translate(-50%, -50%)", // Center the dot
            }}
          ></div>
        )} */}
      </DeckGL>
      <VisibleTracker setUserLocation={setUserLocation} />
    </div>
  );
};

export default MapPage;
