# ⚡ MEDIVISION Hospital Finder Map - Quick Start Guide

**Get the map running in less than 2 minutes!**

## 🚀 One-Command Setup

### On Windows (Recommended)
```batch
# Double-click this file:
start-server.bat

# OR open PowerShell in this folder and run:
python -m http.server 8000
```

Then open in browser: **http://localhost:8000**

### On macOS/Linux
```bash
# Run this command in the map-module folder:
python3 -m http.server 8000

# OR using Node.js:
npx http-server
```

Then open in browser: **http://localhost:8000**

---

## 📋 What You Get

✅ **Interactive Hospital Map** - Find hospitals, clinics, pharmacies  
✅ **Smart Search** - Search by location or hospital name  
✅ **Your Location** - See your current position on map  
✅ **Hospital Details** - Phone, address, hours, website  
✅ **Mobile Responsive** - Works on phone, tablet, desktop  
✅ **Modern UI** - Glassmorphic design with animations  

---

## 📁 File Structure

```
map-module/
├── index.html              ← Main map interface
├── style.css               ← Beautiful styling
├── map.js                  ← All the logic
├── README.md               ← Full documentation
├── DEPLOYMENT.md           ← Integration guide
├── INTEGRATION.html        ← How to use in your app
├── start-server.bat        ← Windows server starter
├── start-server.sh         ← Mac/Linux server starter
└── QUICKSTART.md           ← This file!
```

---

## 🎯 Getting Started (3 Easy Steps)

### Step 1: Navigate to the Map Module
```bash
cd frontend/map-module
```

### Step 2: Start a Local Server

**Windows:**
```batch
start-server.bat
```

**Mac/Linux:**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Manual (Any OS):**
```bash
python -m http.server 8000
```

### Step 3: Open in Browser
```
http://localhost:8000
```

---

## 🗺️ Using the Map

### Finding Hospitals
1. **Map loads** with hospitals in Pune area
2. **Markers appear** - Each color represents a type:
   - 🏥 Blue = Hospital
   - ⚕️ Green = Clinic  
   - 💊 Orange = Pharmacy

### Searching
1. Type in search bar: "city name" or "hospital name"
2. Wait for suggestions
3. Click on result to go there
4. Marker appears at location

### Your Location
1. Click 📍 button (bottom right)
2. Allow browser permission
3. Red marker shows your location
4. Map centers on you

### View Hospital Details
1. Click any marker
2. **Info panel opens** at bottom with:
   - Hospital name
   - Address
   - Phone (clickable to call)
   - Hours
   - Website

### Filter Results
Use checkboxes at top:
- ✓ Hospital
- ✓ Clinic
- ✓ Pharmacy

---

## 🔗 Integrating with MEDIVISION React App

### Option 1: Link to Map Page (Easiest)

Add link in your navigation:
```jsx
<a href="/map-module/index.html" target="_blank">
  🗺️ Hospital Finder
</a>
```

### Option 2: Embed in React (Recommended)

Create `src/pages/HospitalFinder.jsx`:

```jsx
export default function HospitalFinder() {
  return (
    <iframe 
      src="/map-module/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none'
      }}
      allow="geolocation"
    />
  );
}
```

Update your router:
```jsx
<Route path="/hospitals" element={<HospitalFinder />} />
```

### Option 3: Direct HTML File

Copy `index.html` to your public folder and access directly.

---

## ⚙️ Configuration

### Change Default City

Edit `map.js` line 30-33:

```javascript
// Change from Pune to Mumbai
this.PUNE_LAT = 19.0760;      // Mumbai latitude
this.PUNE_LNG = 72.8777;      // Mumbai longitude
```

**Common Cities in India:**
```javascript
// Pune
lat: 18.5204, lng: 73.8567

// Mumbai
lat: 19.0760, lng: 72.8777

// Delhi
lat: 28.6139, lng: 77.2090

// Bangalore
lat: 12.9716, lng: 77.5946

// Hyderabad
lat: 17.3850, lng: 78.4867
```

### Change Colors

Edit `style.css` lines 16-22:

```css
--primary: #2563eb;        /* Change blue to your color */
--secondary: #10b981;      /* Change green */
--accent: #f59e0b;         /* Change orange */
```

**Color Palette Ideas:**
- Medical Blue: `#2563eb`
- Health Green: `#10b981`
- Emergency Red: `#ef4444`
- Warning Amber: `#f59e0b`

---

## 📱 Mobile Testing

### Test on Your Phone

1. **Get Local IP Address**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Connect from Phone**
   - WiFi: Connect to same network as computer
   - Open: `http://[YOUR_IP]:8000`
   - Allow geolocation when prompted

3. **Features to Test**
   - ✓ Map loads
   - ✓ Markers appear
   - ✓ Search works
   - ✓ Geolocation works
   - ✓ Touch markers to view details
   - ✓ Filter toggles work

---

## 🆘 Troubleshooting

### Map Not Loading?
```
❌ Problem: Blank screen or no map
✅ Solution: 
   1. Check browser console (F12)
   2. Ensure server is running
   3. Check URL: http://localhost:8000 (not file://)
```

### Geolocation Not Working?
```
❌ Problem: Can't find my location
✅ Solution:
   1. Allow permission when prompted
   2. Use HTTPS or localhost
   3. Check browser settings
   4. Try on another browser
```

### No Hospitals Showing?
```
❌ Problem: Map shows but no markers
✅ Solution:
   1. Check filters - at least one must be checked
   2. Zoom out to see more area
   3. Try different city
   4. Check browser console for errors
```

### Search Not Finding Results?
```
❌ Problem: Search returns no results
✅ Solution:
   1. Type at least 2 characters
   2. Try different search term
   3. Try city name instead of hospital name
   4. Check spelling
```

### "Map tiles are not loading"
```
❌ Problem: Map area is gray
✅ Solution:
   1. Check internet connection
   2. May be temporary CDN issue
   3. Try refreshing page
   4. Check if OpenStreetMap is accessible
```

---

## 📊 Performance Tips

### For Better Speed
1. **Use Chrome or Firefox** - faster than Safari/Edge
2. **On Better WiFi** - API calls are faster
3. **Zoom to Your Area** - load fewer hospitals
4. **Filter Results** - uncheck pharmacy if not needed

### For Mobile
1. **Reduce zoom level** - loads more data initially
2. **Use 4G/5G** - faster API responses
3. **Close other tabs** - more memory for map

---

## 🔧 Code Explanation

### Key Files

**index.html**
- Map container `<div id="map">`
- Search bar `<input id="searchInput">`
- Filter checkboxes
- Info panel for details

**style.css**
- Glassmorphism effect
- Responsive design
- Marker colors
- Animations

**map.js**
- MapManager class
- Leaflet initialization
- API calls to Overpass & Nominatim
- Geolocation handling
- Marker management

### Key APIs Used
- **Leaflet.js** - Map library (no API key)
- **OpenStreetMap** - Map tiles (free)
- **Overpass API** - Hospital data (free)
- **Nominatim** - Search & geocoding (free)
- **Browser Geolocation** - Your location (built-in)

---

## 🎨 Customization Examples

### Example 1: Hide Search Bar
Edit `index.html`, line 23:
```html
<!-- Hide search bar -->
<div class="search-panel" style="display: none;">
```

### Example 2: Change Marker Icon
Edit `map.js`, line 300:
```javascript
// Change hospital marker emoji
hospital: '🏥',  // Change this emoji
clinic: '⚕️',
pharmacy: '💊'
```

### Example 3: Auto-zoom on Search
Edit `map.js`, line 350:
```javascript
// Increase zoom when searching
this.SEARCH_ZOOM = 20;  // Was 15, now 20
```

### Example 4: Show Only Hospitals
Edit `index.html`, lines 50-58:
```html
<!-- Uncheck others by default -->
<input type="checkbox" id="filterClinic">  <!-- Remove: checked -->
<input type="checkbox" id="filterPharmacy"> <!-- Remove: checked -->
```

---

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Integration Guide**: See `INTEGRATION.html`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Leaflet Docs**: https://leafletjs.com/
- **OpenStreetMap**: https://www.openstreetmap.org/

---

## 💡 Pro Tips

1. **Bookmark the Local URL** - For quick testing
2. **Use Live Server** - VS Code extension for auto-refresh
3. **Check Console Logs** - F12 → Console for errors
4. **Test on Mobile Early** - Different experience than desktop
5. **Use Chrome DevTools** - Simulate mobile devices
6. **Cache Results** - Add LocalStorage for offline

---

## 🚀 Next Steps

1. **Get Map Running** ← You are here
2. **Customize for Your City** → Edit location in `map.js`
3. **Integrate with React** → Use iframe method
4. **Test on Mobile** → Use local IP address
5. **Deploy to Production** → Follow `DEPLOYMENT.md`

---

## ❓ FAQ

**Q: Do I need an API key?**  
A: No! All APIs are free and public.

**Q: Will it work without internet?**  
A: No, APIs require online access. Use PWA for offline mode.

**Q: Can I use this on my website?**  
A: Yes! It's open source and free to use.

**Q: How often is hospital data updated?**  
A: Weekly from OpenStreetMap community updates.

**Q: Can I add my own hospitals?**  
A: Yes, contribute to OpenStreetMap.

**Q: Works on IE 11?**  
A: No, use modern browsers (Chrome, Firefox, Safari, Edge).

---

## 🎉 You're All Set!

Your hospital finder map is ready to use! 

**Next: Open `http://localhost:8000` in your browser →** 🗺️

---

**Questions?** Check README.md or DEPLOYMENT.md  
**Ready to integrate?** Follow the React integration guide above  
**Need help?** Review the troubleshooting section  

---

**MEDIVISION Hospital Finder Map v1.0.0**  
*Find Healthcare Anywhere* 🏥
