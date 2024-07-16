import Map, { useControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
// mapboxgl.workerClass =
//   require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;
// import { MapboxOverlay } from "@deck.gl/mapbox/typed";
import { IconLayer } from "deck.gl";
import DeckGL from "deck.gl";
import { PointCloudLayer } from "@deck.gl/layers";
// const DeckGLOverlay = (mapboxOverlayProps) => {
//   const overlay = useControl(() => new MapboxOverlay(mapboxOverlayProps));
//   overlay.setProps(mapboxOverlayProps);
//   return null;
// };

const MapPage = () => {
  const INITIAL_VIEW_STATE = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 14,
    pitch: 0,
    bearing: 0,
  };

  const data = [
    {
      position: [-122.45, 37.78, 12222.455],
      size: 100,
      color: [255, 140, 0],
      elevation: 1000,
    },
    {
      position: [-122.45, 37.75, 12222.455],
      size: 100,
      color: [55, 140, 0],
      elevation: 1000,
    },
  ];

  const pointCloudLayer = new PointCloudLayer({
    id: "pointcloud-layer",
    data: data,
    pickable: true,
    getPosition: (d) => d.position,
    getRadius: (d) => d.size,
    getColor: (d) => d.color,
    getElevation: (d) => d.elevation,
    elevationScale: 1,
  });
  return (
    <DeckGL
      style={{ height: "100vh", width: "100vw", position: "fixed" }}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={[pointCloudLayer]}
    >
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_API}
        mapStyle={"mapbox://styles/mapbox/dark-v11"}
      />
    </DeckGL>
  );
};

export default MapPage;
