import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Map from "./pages/map/map";
import NotFound from "./pages/notfound/notfound";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Map/>} exact />
          <Route path="/" element={<NotFound/>} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;