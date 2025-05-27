import React from "react";
import ReactDOM from "react-dom";
// import * as smartbanner from './vendor/smartbanner.min.js';
// import './vendor/smartbanner.min.css';
// import '../style/app.scss';
import Mapbox from './mapbox.jsx'; // Changed from App

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Mapbox />, document.getElementById('index'), // Changed from <App />
  )
});