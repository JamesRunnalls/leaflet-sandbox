import React, { Component } from "react";
import L from "leaflet";
import "./leaflet_geotiff";
import "./leaflet_colorpicker";
import "./css/leaflet.css";

class Basemap extends Component {
  async componentDidMount() {
    this.store = {};
    var center = [46.501, 7.992];
    var zoom = 10;
    var zoomControl = false;
    this.map = L.map("map", {
      preferCanvas: true,
      zoomControl,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
