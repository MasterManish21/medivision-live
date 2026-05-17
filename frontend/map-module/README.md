# 🏥 MEDIVISION - Hospital Finder Map Module

A modern, responsive web-based hospital finder map for the MEDIVISION healthcare application. Built with **Leaflet.js**, **OpenStreetMap**, and **vanilla JavaScript** — no frameworks, no API keys required.

## 🌟 Features

### Core Features
✅ **Interactive Map** - Full-screen Leaflet map centered on Pune, Maharashtra  
✅ **Hospital Locator** - Fetch nearby hospitals, clinics, and pharmacies dynamically  
✅ **Smart Markers** - Color-coded markers with emojis (hospitals 🏥, clinics ⚕️, pharmacies 💊)  
✅ **Marker Clustering** - Automatically groups nearby markers for better performance  
✅ **Geolocation** - Detect and display user's current location with browser API  
✅ **Search Functionality** - Find locations, hospitals, and areas in real-time  
✅ **Filter System** - Toggle between hospitals, clinics, and pharmacies  
✅ **Info Panel** - View detailed hospital information (address, phone, hours, website)  

### UI/UX Enhancements
✨ **Glassmorphism Design** - Modern frosted glass effect on panels  
✨ **Medical Theme** - Healthcare-inspired color palette  
✨ **Smooth Animations** - Pop-in markers, sliding panels, hover effects  
✨ **Mobile Responsive** - Optimized for desktop, tablet, and mobile  
✨ **Loading Spinner** - Visual feedback during data fetching  
✨ **Dark Theme Support** - Gradient purple background with contrasting UI  

### API Integration (Free & Open-Source)
🔷 **Leaflet.js** - Interactive map library  
🔷 **OpenStreetMap** - Free tile provider (no API key needed)  
🔷 **Overpass API** - Query hospitals and facilities  
🔷 **Nominatim API** - Reverse geocoding and search  
🔷 **Browser Geolocation API** - User location detection  

## 📦 Installation & Usage

### Quick Start (Local Testing)

#### Option 1: Direct Browser Open
1. Extract/navigate to the `map-module` folder
2. Double-click `index.html` to open in browser
3. Grant geolocation permission when prompted
4. Explore hospitals on the map!

#### Option 2: Local Server (Recommended for API calls)
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js (http-server)
npx http-server

# Or using Live Server (VS Code Extension)
# Right-click index.html → Open with Live Server
```
Then visit: `http://localhost:8000/map-module/`

### Integration with MEDIVISION Frontend

To integrate this map module into the React frontend:

```jsx
// In your React component (e.g., Hospitals.jsx)
useEffect(() => {
  // Load the map module
  const script = document.createElement('script');
  script.src = '/map-module/map.js';
  document.body.appendChild(script);
}, []);

return (
  <div style={{ width: '100vw', height: '100vh' }}>
    <div id="map"></div>
  </div>
);
```

Or create an iframe:
```jsx
<iframe 
  src="/map-module/index.html" 
  style={{ width: '100%', height: '600px', border: 'none', borderRadius: '10px' }}
/>
```

## 🎯 Features Deep Dive

### 1. **Hospital Discovery**
- Fetches hospitals, clinics, and pharmacies from OpenStreetMap data
- Uses Overpass API to query facilities in Pune region
- Displays results with smooth marker animations

### 2. **Smart Search**
```
Steps:
1. Type location/hospital name in search bar (minimum 2 characters)
2. View suggestions as you type (Nominatim autocomplete)
3. Click on suggestion to navigate
4. Map pans to location with marker
```

### 3. **User Location**
```
Steps:
1. Click the 📍 (Geolocation button)
2. Allow browser permission
3. Your location appears with red pulsing marker
4. Map centers on your position
```

### 4. **Filter Controls**
- Toggle Hospital, Clinic, and Pharmacy checkboxes
- Markers update in real-time
- Counter updates showing filtered results

### 5. **Info Panel**
- Click any marker to view details
- Shows:
  - Hospital name and type
  - Address with 📍
  - Phone number (clickable tel: link)
  - Operating hours
  - Website link (if available)
- "View Full Details" button for future expansion

## 📁 File Structure

```
map-module/
├── index.html          # Main HTML (map container, search bar, UI elements)
├── style.css           # Styling (glassmorphism, animations, responsive)
├── map.js              # JavaScript logic (MapManager class)
└── README.md           # This file
```

### index.html Components
- **Search Panel** - Glassmorphic search bar with buttons
- **Filter Panel** - Checkbox filters for facility types
- **Map Container** - Leaflet map canvas
- **Loading Spinner** - Shows during data fetching
- **Info Panel** - Hospital details popup
- **Bottom Info Bar** - Status and stats

### style.css Sections
- **Glassmorphism** - Frosted glass effect with blur
- **Medical Theme** - Blue, green, amber color palette
- **Responsive Design** - Mobile, tablet, desktop breakpoints
- **Animations** - Pop-in, slide-up, pulse, spin effects
- **Custom Markers** - Emoji-based marker styling
- **Leaflet Customization** - Cluster styling

### map.js Architecture
```javascript
MapManager Class
├── init() - Initialize app
├── initMap() - Create Leaflet map
├── setupEventListeners() - Attach handlers
├── fetchNearbyHospitals() - Query Overpass API
├── createMarker() - Generate custom markers
├── loadUserLocation() - Browser geolocation
├── handleSearchInput() - Debounced search
├── searchLocations() - Nominatim queries
├── applyFilters() - Filter logic
├── showInfoPanel() - Display details
└── Helper methods - Error handling, UI updates
```

## 🎨 Customization

### Change Map Center & Zoom
Edit `map.js` in the `MapManager` constructor:
```javascript
this.PUNE_LAT = 18.5204;      // Change latitude
this.PUNE_LNG = 73.8567;      // Change longitude
this.ZOOM_LEVEL = 12;         // Initial zoom
this.SEARCH_ZOOM = 15;        // Search result zoom
```

### Modify Color Palette
Edit `style.css` variables:
```css
:root {
    --primary: #2563eb;        /* Change primary blue */
    --secondary: #10b981;      /* Change green */
    --accent: #f59e0b;         /* Change warning color */
    --danger: #ef4444;         /* Change red */
}
```

### Add More Facility Types
In `map.js`, update the `processOverpassData()` method:
```javascript
if (tags.amenity === 'clinic') type = 'clinic';
else if (tags.amenity === 'pharmacy') type = 'pharmacy';
else if (tags.amenity === 'doctor') type = 'doctor';  // Add custom type
```

### Customize Marker Icons
Modify `getTypeEmoji()` or use Leaflet icon libraries:
```javascript
getTypeEmoji(type) {
    const emojis = {
        hospital: '🏥',
        clinic: '⚕️',
        pharmacy: '💊',
        doctor: '👨‍⚕️'
    };
    return emojis[type] || '📍';
}
```

## 🔧 API Configuration

### Overpass API
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Query Language**: Overpass Query Language (QL)
- **Free**: ✅ No rate limits (best effort)
- **Customization**: Modify bounding box and amenity types

### Nominatim API
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Free**: ✅ Free tier available
- **Usage Policy**: Limit to 1 request/second (respected in code)
- **Attribution**: ✅ Required (included in code)

### Geolocation API
- **Browser Built-in**: ✅ Native API
- **Privacy**: ✅ Requires user permission
- **Accuracy**: Varies (30-1000 meters typically)

## 📱 Mobile Responsiveness

### Breakpoints
- **Desktop**: > 768px - Full features
- **Tablet**: 480px - 768px - Optimized layout
- **Mobile**: < 480px - Compact UI

### Mobile-Specific Optimizations
- Search bar wraps on small screens
- Filter panel in vertical layout
- Touch-friendly button sizes (minimum 44x44px)
- Scrollable info panel
- Adjusted font sizes

## ⚠️ Known Limitations & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| No results | Sparse OSM data | Use nearby city names |
| Slow API | Overpass rate limiting | Cache results locally |
| Geolocation denied | Browser permission | Manually search location |
| Map not loading | CORS issue | Use local server (http-server) |

## 🚀 Performance Tips

1. **Cache Results** - Save hospital data to localStorage
2. **Lazy Load** - Load nearby hospitals on zoom change
3. **Limit Markers** - Set max 50 markers per view
4. **Debounce Search** - Already implemented (300ms)
5. **Clustering** - Automatically enabled for 10+ markers

## 🔐 Security & Privacy

✅ **No Backend Required** - All APIs are public  
✅ **Client-Side Only** - No user data stored server-side  
✅ **Geolocation Privacy** - User must grant permission  
✅ **HTTPS Ready** - Works on http and https  
✅ **CORS Compliant** - Uses public APIs with CORS headers  

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| IE 11 | ❌ Not supported |

## 📞 API Rate Limits & Usage

### Overpass API
- Free tier with fair use policy
- Recommended: 1-5 requests per minute
- Best practices: Implement caching

### Nominatim API
- Public tile server with usage guidelines
- Rate limit: ~1 request/second
- Already implemented with debounce

## 🎓 Learning Resources

- **Leaflet Docs**: https://leafletjs.com/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **Overpass API**: https://overpass-turbo.eu/
- **Nominatim API**: https://nominatim.org/
- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API

## 🐛 Troubleshooting

### Map Not Displaying
```
✓ Check if index.html is opened from a server (not file://)
✓ Open browser console (F12) for errors
✓ Ensure Leaflet CDN is loading (check Network tab)
```

### No Hospitals Showing
```
✓ Check browser console for API errors
✓ Verify geolocation data exists for your region
✓ Try zooming out to see more results
✓ Check filter settings - ensure at least one is checked
```

### Search Not Working
```
✓ Ensure you've typed at least 2 characters
✓ Wait for debounce timeout (300ms)
✓ Check browser network tab for API calls
✓ Try different search terms
```

### Geolocation Fails
```
✓ Allow browser permission prompt
✓ Check if HTTPS is used (or localhost)
✓ Try manual search instead
✓ Check browser's location permissions in settings
```

## 🔄 Future Enhancements

- [ ] **Route Planning** - Directions to selected hospital
- [ ] **Hospital Rankings** - User reviews and ratings
- [ ] **Booking Integration** - Direct appointment booking
- [ ] **Emergency Mode** - Red-alert for emergency services
- [ ] **Multilingual** - Support for regional languages
- [ ] **Dark Mode Toggle** - User preference
- [ ] **Service Filters** - Filter by specialization (ICU, pediatrics, etc.)
- [ ] **Real-time Availability** - Bed availability status
- [ ] **Insurance Filter** - Filter by accepted insurance
- [ ] **Heatmap** - Disease outbreak visualization

## 📄 License & Attribution

This module is **free and open-source** for use in the MEDIVISION project.

**Data Sources**:
- OpenStreetMap Data © OpenStreetMap Contributors (ODbL)
- Tiles © OpenStreetMap (CC BY-SA 2.0)
- Leaflet © Leaflet Contributors

**Libraries**:
- Leaflet.js - BSD 2-Clause License
- Leaflet.MarkerCluster - MIT License

## 💬 Support & Feedback

For issues, feature requests, or improvements:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with different regions
4. Share feedback with the MEDIVISION team

---

**Made with ❤️ for MEDIVISION - Your Healthcare Companion**

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
