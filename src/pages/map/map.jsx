import React, { Component } from "react";
import Basemap from "../../components/leaflet/basemap";
import "./map.css"
import "../../App.css";

class Map extends Component {
  render() {
    document.title = "Leaflet Sandbox";
    return (
      <div className="map">
        <Basemap />
      </div>
    );
  }
}

export default Map;
