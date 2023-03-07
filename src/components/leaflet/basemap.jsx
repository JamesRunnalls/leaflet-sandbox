import React, { Component } from "react";
import axios from "axios";
import L from "leaflet";
import "./leaflet_geotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./css/leaflet.css";

class Basemap extends Component {
  addGeotiff = async (url) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return L.geotiff(data, {}).addTo(this.map);
  };

  addStreamlines = async (url) => {
    var { data } = await axios.get(url);
    return L.streamlines(data, {
      xMin: 6.153,
      xMax: 6.93,
      yMin: 46.206,
      yMax: 46.519,
    }).addTo(this.map);
  };

  addVectorfield = async (url) => {
    var { data } = await axios.get(url);
    return L.vectorfield(data, {}).addTo(this.map);
  };

  async componentDidMount() {
    this.store = {};
    var center = [46.5, 6.67];
    var zoom = 11;
    this.map = L.map("map", {
      preferCanvas: true,
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

    this.geotiff = this.addGeotiff(
      "https://snowlines-geotiff.s3.eu-central-1.amazonaws.com/RGB_L2SNOW_reproj_idepix_subset_S3B_OL_1_EFR____20201227T101107_20201227T101407_20201227T121946_0179_047_179_2160_LN1_O_NR_002.SEN3.tif"
    );

    this.streamline = this.addStreamlines(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/streamlines.json"
    );

    this.vectorfield = this.addVectorfield(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/vectorfield.json"
    );
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
