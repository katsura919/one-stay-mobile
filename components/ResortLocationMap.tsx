import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';

interface Resort {
  _id: string;
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface ResortLocationMapProps {
  resort: Resort;
}

export default function ResortLocationMap({ resort }: ResortLocationMapProps) {
  const openInMaps = () => {
    const { latitude, longitude } = resort.location;
    // Open in OpenStreetMap instead of Google Maps (free alternative)
    const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
    Linking.openURL(osmUrl).catch(err => console.error('Error opening map:', err));
  };

  // HTML content with Leaflet.js for interactive map
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        
        /* Style zoom controls for better visibility */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #333 !important;
          font-size: 20px !important;
          font-weight: bold !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f4f4f4 !important;
        }
        .leaflet-touch .leaflet-control-zoom a {
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map with zoom controls explicitly enabled
        const map = L.map('map', {
          zoomControl: true,
          zoomControlOptions: {
            position: 'topright'
          }
        }).setView([${resort.location.latitude}, ${resort.location.longitude}], 16);
        
        // Add OpenStreetMap tiles (100% free, no API key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 3
        }).addTo(map);

        // Custom marker icon (red pin)
        const redIcon = L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDMyIDQ4Ij48cGF0aCBmaWxsPSIjRUYzMzQwIiBkPSJNMTYgMEMxMC40ODUgMCA2IDQuNDg1IDYgMTBjMCA5IDE2IDI2IDE2IDI2czE2LTE3IDE2LTI2YzAtNS41MTUtNC40ODUtMTAtMTAtMTB6Ii8+PGNpcmNsZSBmaWxsPSIjRkZGIiBjeD0iMTYiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==',
          iconSize: [32, 48],
          iconAnchor: [16, 48],
          popupAnchor: [0, -48]
        });

        // Add marker with custom icon
        const marker = L.marker([${resort.location.latitude}, ${resort.location.longitude}], { icon: redIcon })
          .addTo(map)
          .bindPopup(\`
            <div style="font-family: Arial, sans-serif; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${resort.resort_name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">${resort.location.address.replace(/'/g, "\\'").replace(/"/g, '&quot;')}</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">
                ${resort.location.latitude.toFixed(6)}, ${resort.location.longitude.toFixed(6)}
              </p>
            </div>
          \`)
          .openPopup();

        // Add scale control
        L.control.scale().addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Map View using Leaflet.js */}
      <WebView
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      
      {/* Resort Info Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.resortName}>
          {resort.resort_name}
        </Text>
        <Text style={styles.address}>
          {resort.location.address}
        </Text>
        <Text style={styles.coordinates}>
          {resort.location.latitude.toFixed(6)}, {resort.location.longitude.toFixed(6)}
        </Text>
        
        <Button mode="contained" onPress={openInMaps} style={styles.button}>
          Open in OpenStreetMap
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
