import React, { Component } from "react";
import { min, max } from "d3";
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

  addFloatGeotiff = async (url, options) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    var map = this.map;
    var floatgeotiff = L.floatgeotiff(data, options);
    var floatgeotifftooltip = floatgeotiff.bindTooltip("my tooltip text", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    floatgeotiff.on("mousemove", function (e) {
      let value = e.value;
      if (value) {
        value = Math.round(value * 1000) / 1000;
        let html = `${value}${options.unit}`;
        floatgeotifftooltip._tooltip._content = html;
        floatgeotifftooltip.openTooltip(e.latlng);
      } else {
        floatgeotifftooltip.closeTooltip();
      }
    });
    floatgeotiff.on("click", function (e) {
      floatgeotifftooltip.closeTooltip();
      let value = e.value;
      if (value) {
        value = Math.round(value * 1000) / 1000;
        let inner = `${value}${options.unit}`;
        let html = `<div>${String(inner)}</div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return floatgeotiff;
  };

  addStreamlines = async (url) => {
    var { data } = await axios.get(url);
    var map = this.map;
    var streamlines = L.streamlines(data, {
      xMin: 6.153,
      xMax: 6.93,
      yMin: 46.206,
      yMax: 46.519,
      paths: 5000,
    });
    var streamlinestooltip = streamlines.bindTooltip("", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    streamlines.on("mousemove", function (e) {
      let { u, v } = e.value;
      if (u && v) {
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let html = `${mag}m/s ${deg}°`;
        streamlinestooltip._tooltip._content = html;
        streamlinestooltip.openTooltip(e.latlng);
      } else {
        streamlinestooltip.closeTooltip();
      }
    });
    streamlines.on("click", function (e) {
      streamlinestooltip.closeTooltip();
      if (e.value !== null && e.value.u !== null) {
        let { u, v } = e.value;
        let { lat, lng } = e.latlng;
        lat = Math.round(lat * 1000) / 1000;
        lng = Math.round(lng * 1000) / 1000;
        console.log(lat, lng);
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let value = Math.round(mag * 1000) / 1000;
        let inner = `${value}m/s ${deg}°`;
        let html = `<div>${String(inner)} </div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return streamlines;
  };

  addVectorfield = async (url) => {
    var { data } = await axios.get(url);
    var map = this.map;
    var vectorfield = L.vectorfield(data, { vectorArrowColor: true });
    var vectorfieldtooltip = vectorfield.bindTooltip("my tooltip text", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    vectorfield.on("mousemove", function (e) {
      let { u, v } = e.value;
      if (u && v) {
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let html = `${mag}m/s ${deg}°`;
        vectorfieldtooltip._tooltip._content = html;
        vectorfieldtooltip.openTooltip(e.latlng);
      } else {
        vectorfieldtooltip.closeTooltip();
      }
    });
    vectorfield.on("click", function (e) {
      vectorfieldtooltip.closeTooltip();
      if (e.value !== null && e.value.u !== null) {
        let { u, v } = e.value;
        let { lat, lng } = e.latlng;
        lat = Math.round(lat * 1000) / 1000;
        lng = Math.round(lng * 1000) / 1000;
        console.log(lat, lng);
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let value = Math.round(mag * 1000) / 1000;
        let inner = `${value}m/s ${deg}°`;
        let html = `<div>${String(inner)}</div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return vectorfield;
  };

  addTemperature = async (
    geometry_url,
    values_url,
    options,
    index = 0,
    timeout = 6000
  ) => {
    var response = await Promise.all([
      axios.get(geometry_url, { timeout: timeout }),
      axios.get(values_url, { timeout: timeout }),
    ]);
    var layer = L.layerGroup();
    var geometry = response[0].data;
    var temperature = response[1].data;
    geometry = geometry
      .split("\n")
      .map((g) => g.split(",").map((s) => parseFloat(s)));
    temperature = temperature
      .split("\n")
      .map((g) => g.split(",").map((s) => parseFloat(s)));

    var x = geometry[0].length / 2;
    var y = geometry.length;

    var min_value = min(temperature.flat());
    var max_value = max(temperature.flat());
    var palette = [
      { color: [255, 255, 255], point: 0 },
      { color: [0, 0, 0], point: 1 },
    ];

    if ("min" in options) {
      min_value = options.min;
    }
    if ("max" in options) {
      max_value = options.max;
    }
    if ("palette" in options) {
      palette = options.palette;
    }

    for (var i = 1; i < y - 1; i++) {
      for (var j = 1; j < x - 1; j++) {
        if (!isNaN(temperature[i + index * y][j])) {
          let color = this.getColor(
            temperature[i + index * y][j],
            min_value,
            max_value,
            palette
          );
          let coords = this.getCellCorners(geometry, i, j, x);
          layer.addLayer(
            L.polygon(coords, {
              color: `rgb(${color.join(",")})`,
              fillColor: `rgb(${color.join(",")})`,
              fillOpacity: 1,
              title: "here",
            })
          );
        }
      }
    }
    return layer;
  };

  getCellCorners = (data, i, j, x) => {
    function cellCorner(center, opposite, left, right) {
      if (isNaN(center[0])) {
        return false;
      } else if (!isNaN(opposite[0]) && !isNaN(left[0]) && !isNaN(right[0])) {
        var m1 = (center[1] - opposite[1]) / (center[0] - opposite[0]);
        var m2 = (left[1] - right[1]) / (left[0] - right[0]);
        m1 = isFinite(m1) ? m1 : 0.0;
        m2 = isFinite(m2) ? m2 : 0.0;
        var c1 = opposite[1] - m1 * opposite[0];
        var c2 = right[1] - m2 * right[0];
        var x = (c2 - c1) / (m1 - m2);
        var y = m1 * x + c1;
        return [x, y];
      } else if (!isNaN(opposite[0])) {
        let x = center[0] + (opposite[0] - center[0]) / 2;
        let y = center[1] + (opposite[1] - center[1]) / 2;
        return [x, y];
      } else if (!isNaN(left[0]) && !isNaN(right[0])) {
        let x = left[0] + (right[0] - left[0]) / 2;
        let y = left[1] + (right[1] - left[1]) / 2;
        return [x, y];
      } else if (!isNaN(right[0])) {
        let x =
          center[0] + (right[0] - center[0]) / 2 + (right[1] - center[1]) / 2;
        let y =
          center[1] + (right[1] - center[1]) / 2 - (right[0] - center[0]) / 2;
        return [x, y];
      } else if (!isNaN(left[0])) {
        let x =
          center[0] + (left[0] - center[0]) / 2 - (left[1] - center[1]) / 2;
        let y =
          center[1] + (left[1] - center[1]) / 2 + (left[0] - center[0]) / 2;
        return [x, y];
      } else {
        return false;
      }
    }

    function oppositePoint(center, corner) {
      let x = center[0] + center[0] - corner[0];
      let y = center[1] + center[1] - corner[1];
      return [x, y];
    }
    // TopLeft
    var tl = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i - 1][j - 1], data[i - 1][j - 1 + x]],
      [data[i][j - 1], data[i][j - 1 + x]],
      [data[i - 1][j], data[i - 1][j + x]]
    );
    // BottomLeft
    var bl = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i + 1][j - 1], data[i + 1][j - 1 + x]],
      [data[i + 1][j], data[i + 1][j + x]],
      [data[i][j - 1], data[i][j - 1 + x]]
    );
    // BottomRight
    var br = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i + 1][j + 1], data[i + 1][j + 1 + x]],
      [data[i][j + 1], data[i][j + 1 + x]],
      [data[i + 1][j], data[i + 1][j + x]]
    );
    // TopRight
    var tr = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i - 1][j + 1], data[i - 1][j + 1 + x]],
      [data[i - 1][j], data[i - 1][j + x]],
      [data[i][j + 1], data[i][j + 1 + x]]
    );
    if (!tl && br) tl = oppositePoint([data[i][j], data[i][j + x]], br);
    if (!bl && tr) bl = oppositePoint([data[i][j], data[i][j + x]], tr);
    if (!br && tl) br = oppositePoint([data[i][j], data[i][j + x]], tl);
    if (!tr && bl) tr = oppositePoint([data[i][j], data[i][j + x]], bl);
    if (tl && bl && br && tr) {
      return [tl, bl, br, tr];
    } else {
      return false;
    }
  };

  getColor = (value, min, max, palette) => {
    if (value === null || isNaN(value)) {
      return false;
    }
    if (value > max) {
      return palette[palette.length - 1].color;
    }
    if (value < min) {
      return palette[0].color;
    }
    var loc = (value - min) / (max - min);

    var index = 0;
    for (var i = 0; i < palette.length - 1; i++) {
      if (loc >= palette[i].point && loc <= palette[i + 1].point) {
        index = i;
      }
    }
    var color1 = palette[index].color;
    var color2 = palette[index + 1].color;

    var f =
      (loc - palette[index].point) /
      (palette[index + 1].point - palette[index].point);

    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
    ];

    return rgb;
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
    /* 
    1. Initialise Map
    2. Download data
    3. Add layers to map
    4. Update layers
    */


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

    var mapbox = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);

    var mapbox = L.tileLayer(
      "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/b5aabd36bb3cd302cb173b7acb7fef22-0ef8d2eb7e9f017c3b0ba1187ce8e0be/tiles/{z}/{x}/{y}",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://earthengine.google.com/'>Google Earth Engine</a>",
      }
    ).addTo(this.map);

    var sentinel2_wms = this.addSentinel(
      "https://services.sentinel-hub.com/ogc/wms/b8bf8b31-9b54-42b5-aad1-ab85ae32020e"
    );

    var sentinel3_geotiff = await this.addGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/sentinel3.tif"
    );

    var tsm_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s2_tsm_singleband_float.tiff",
      {
        unit: "g m-3",
        min: 0,
        max: 8,
        palette: [
          { color: [68, 1, 84], point: 0 },
          { color: [59, 82, 139], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [94, 201, 98], point: 0.75 },
          { color: [253, 231, 37], point: 1 },
        ],
      }
    );

    var secchi_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s2_secchi_singleband_float.tiff",
      {
        unit: "m",
        min: 0,
        max: 5,
        palette: [
          { color: [253, 231, 37], point: 0 },
          { color: [94, 201, 98], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [59, 82, 139], point: 0.75 },
          { color: [68, 1, 84], point: 1 },
        ],
      }
    );

    var s3_secchi_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s3_secchi_singleband_float.tiff",
      {
        unit: "m",
        min: 0,
        max: 5,
        heightOffset: -8,
        palette: [
          { color: [253, 231, 37], point: 0 },
          { color: [94, 201, 98], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [59, 82, 139], point: 0.75 },
          { color: [68, 1, 84], point: 1 },
        ],
      }
    );

    var streamlines = await this.addStreamlines(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/streamlines.json"
    );

    var vectorfield = await this.addVectorfield(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/vectorfield.json"
    );

    var temperature = await this.addTemperature(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/geometry.txt",
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/temperature.txt",
      {
        palette: [
          { color: [253, 231, 37], point: 0 },
          { color: [94, 201, 98], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [59, 82, 139], point: 0.75 },
          { color: [68, 1, 84], point: 1 },
        ],
      }
    );

    var baseMaps = {
      mapbox: mapbox,
    };

    // vectorfield.addTo(this.map);

    var overlayMaps = {
      "Sentinel 2 (WMS)": sentinel2_wms,
      "Sentinel 3 (GeoTiff)": sentinel3_geotiff,
      "TSM (S2)": tsm_geotiff,
      "Secchi (S2)": secchi_geotiff,
      "Secchi (S3)": s3_secchi_geotiff,
      "Streamlines (Delft3D)": streamlines,
      "Flow Field (Delft3D)": vectorfield,
      "Temperature (Delft3D)": temperature,
    };

    L.control
      .layers(baseMaps, overlayMaps, { collapsed: false })
      .addTo(this.map);
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
