import Map, { useControl } from "react-map-gl";
import ControlPanel from "./ControlPanel/ControlPanel";
import mapboxgl from "mapbox-gl";
// mapboxgl.workerClass =
//   require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;
// import { MapboxOverlay } from "@deck.gl/mapbox/typed";
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
import React, { useEffect, useState } from "react";
// const DeckGLOverlay = (mapboxOverlayProps) => {
//   const overlay = useControl(() => new MapboxOverlay(mapboxOverlayProps));
//   overlay.setProps(mapboxOverlayProps);
//   return null;
// };

const MapPage = () => {
  const INITIAL_VIEW_STATE = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 1,
    pitch: 0,
    bearing: 0,
  };
  const earthRadius = 6.3e6;
  // const data = [
  //   {
  //     position: [-122.45, 37.78, 12222.455],
  //     size: 100,
  //     color: [255, 140, 0],
  //     elevation: 1000,
  //   },
  //   {
  //     position: [-122.45, 37.75, 12222.455],
  //     size: 100,
  //     color: [55, 140, 0],
  //     elevation: 1000,
  //   },
  // ];
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
  };
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(Object.keys(urls)[0]);
  const [watchList, setWatchList] = useState([]);
  const [visibleGroups, setVisibleGroups] = useState([]);
  const [satelliteData, setSatelliteData] = useState({});

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
  // const [satelliteData, setSatelliteData] = useState([]);

  // useEffect(() => {
  //   const fetchSatelliteData = async () => {
  //     if (!selectedGroup) return;

  //     try {
  //       const response = await fetch(urls[`${selectedGroup}`].url);
  //       const textData = await response.text();
  //       const parsedData = parseTLEData(textData);
  //       setSatelliteData(parsedData);
  //     } catch (error) {
  //       console.error("Error fetching satellite data:", error);
  //     }
  //   };

  //   fetchSatelliteData();
  // }, [selectedGroup]);

  // const parseTLEData = (data) => {
  //   const lines = data.trim().split("\n");
  //   const satellites = [];
  //   for (let i = 0; i < lines.length; i += 3) {
  //     satellites.push({
  //       name: lines[i].trim(),
  //       TLE_LINE1: lines[i + 1].trim(),
  //       TLE_LINE2: lines[i + 2].trim(),
  //     });
  //   }
  //   return satellites;
  // };

  //Function to calculate lat/long

  const calculateSatellitePosition = (tleLine1, tleLine2) => {
    const satrec = twoline2satrec(tleLine1, tleLine2);
    const positionAndVelocity = propagate(satrec, new Date());
    const positionEci = positionAndVelocity.position;
    const gmst = gstime(new Date());
    const positionGd = eciToGeodetic(positionEci, gmst);

    const longitude = degreesLong(positionGd.longitude);
    const latitude = degreesLat(positionGd.latitude);
    const altitude = positionGd.height * 10000; // Convert km to meters

    return [longitude, latitude, altitude];
  };

  // converting satellite data into Deck.gl-compatible format

  const createLayers = () => {
    return visibleGroups.map((group, index) => {
      const data = (satelliteData[group] || []).map((satellite) => {
        const [longitude, latitude, altitude] = calculateSatellitePosition(
          satellite.TLE_LINE1,
          satellite.TLE_LINE2
        );
        return {
          position: [longitude, latitude, altitude],
          size: urls[group].size || 1,
          color: urls[group].color || [255, 255, 255], // Default to white if no color is defined
          elevation: 1000,
        };
      });

      // const deckglSatelliteData = satelliteData.map((satellite) => {
      //   const [longitude, latitude, altitude] = calculateSatellitePosition(
      //     satellite.TLE_LINE1,
      //     satellite.TLE_LINE2
      //   );
      //   return {
      //     position: [longitude, latitude, altitude],
      //     size: urls[`${selectedGroup}`].size || 1,
      //     color: [255, 140, 0],
      //     elevation: 1000,
      //   };
      // });

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
  };

  // const pointCloudLayer = new PointCloudLayer({
  //   id: "pointcloud-layer",
  //   data: deckglSatelliteData,
  //   pickable: true,
  //   getPosition: (d) => d.position,
  //   getRadius: (d) => d.size,
  //   pointSize: urls[`${selectedGroup}`].size || 1,
  //   getColor: (d) => d.color,
  //   getElevation: (d) => d.elevation,
  //   elevationScale: 1,
  // });

  return (
    <div>
      <ControlPanel
        urls={urls}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        satelliteData={satelliteData}
        isPopupVisible={isPopupVisible}
        togglePopup={togglePopup}
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
          // maxZoom={16}
          // minZoom={2}
        />
      </DeckGL>
    </div>
  );
};

export default MapPage;
