import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { EmployeeLocation } from '../api/locationApi';

interface TeamLocationMapProps {
  locations: EmployeeLocation[];
  height?: number;
}

export default function TeamLocationMap({ locations, height = 400 }: TeamLocationMapProps) {
  const defaultCenter =
    locations.length > 0
      ? { lat: locations[0].latitude, lng: locations[0].longitude }
      : { lat: 18.5204, lng: 73.8567 };

  const markersJs = locations
    .map(
      (loc) =>
        `L.marker([${loc.latitude}, ${loc.longitude}]).addTo(map).bindPopup(${JSON.stringify(
          `${loc.employee.firstName} ${loc.employee.lastName}`
        )});`
    )
    .join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${defaultCenter.lat}, ${defaultCenter.lng}], 12);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);
          ${markersJs}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView source={{ html }} style={styles.webview} scrollEnabled={false} javaScriptEnabled={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});