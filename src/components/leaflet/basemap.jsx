import React, { Component } from "react";
import axios from "axios";
import L from "leaflet";
import "./leaflet_geotiff";
import "./leaflet_floatgeotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./css/leaflet.css";

class Basemap extends Component {
  addGeotiff = async (url) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return L.geotiff(data, {});
  };

  addFloatGeotiff = async (url) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return L.floatgeotiff(data, {
      min: 0,
      max: 10,
      palette: [
        { color: [0, 0, 128], point: 0 },
        { color: [51, 102, 255], point: 0.142857142857143 },
        { color: [0, 176, 220], point: 0.285714285714286 },
        { color: [0, 153, 51], point: 0.428571428571429 },
        { color: [255, 255, 91], point: 0.571428571428571 },
        { color: [230, 51, 0], point: 0.714285714285714 },
        { color: [204, 0, 0], point: 0.857142857142857 },
        { color: [128, 0, 0], point: 1 },
      ],
    });
  };

  addStreamlines = async (url) => {
    var { data } = await axios.get(url);
    return L.streamlines(data, {
      xMin: 6.153,
      xMax: 6.93,
      yMin: 46.206,
      yMax: 46.519,
      paths: 5000,
    });
  };

  addVectorfield = async (url) => {
    var { data } = await axios.get(url);
    return L.vectorfield(data, {});
  };

  addSentinel = (url) => {
    return L.tileLayer.wms(url, {
      tileSize: 512,
      attribution:
        '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
      urlProcessingApi:
        "https://services.sentinel-hub.com/ogc/wms/1d4de4a3-2f50-493c-abd8-861dec3ae6b2",
      maxcc: 20,
      minZoom: 6,
      maxZoom: 16,
      preset: "TRUE-COLOR",
      layers: "TRUE-COLOR",
      time: "2021-09-06/2021-09-06",
      gain: 3,
    });
  };

  async componentDidMount() {
    this.store = {};
    var center = [46.5, 6.57];
    var zoom = 11;
    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });

    var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    var sentinel2_wms = this.addSentinel(
      "https://services.sentinel-hub.com/ogc/wms/b8bf8b31-9b54-42b5-aad1-ab85ae32020e"
    );

    var sentinel3_geotiff = await this.addGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/sentinel3.tif"
    );

    var tsm_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s2_tsm_singleband_float.tiff"
    );

    var streamlines = await this.addStreamlines(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/streamlines.json"
    );

    var vectorfield = await this.addVectorfield(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/vectorfield.json"
    );

    var baseMaps = {
      OpenStreetMap: osm,
    };

    var overlayMaps = {
      "Sentinel 2 (WMS)": sentinel2_wms,
      "Sentinel 3 (GeoTiff)": sentinel3_geotiff,
      "TSM (S2)": tsm_geotiff,
      "Streamlines (Delft3D)": streamlines,
      "Flow Field (Delft3D)": vectorfield,
    };

    L.control.layers(baseMaps, overlayMaps).addTo(this.map);
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
