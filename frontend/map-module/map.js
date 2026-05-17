/*
  MEDIVISION Hospital Finder
  Live OpenStreetMap + Overpass + Nominatim (no API key)
*/

class MapManager {
    constructor() {
        this.DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 }; // Pune
        this.DEFAULT_ZOOM = 13;
        this.SEARCH_ZOOM = 14;

        this.OVERPASS_API = "https://overpass-api.de/api/interpreter";
        this.NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

        this.map = null;
        this.cluster = L.markerClusterGroup();
        this.userMarker = null;
        this.searchMarker = null;
        this.userLocation = null;

        this.searchDebounce = null;
        this.selectedHospitalId = null;
        this.expandedCardIds = new Set();

        this.filters = {
            hospital: true,
            clinic: true,
            pharmacy: true
        };

        this.hospitals = [];
        this.markersById = new Map();

        this.els = {
            map: document.getElementById("map"),
            mapInfo: document.getElementById("mapInfo"),
            listMeta: document.getElementById("listMeta"),
            hospitalList: document.getElementById("hospitalList"),
            loadingSpinner: document.getElementById("loadingSpinner"),
            searchInput: document.getElementById("searchInput"),
            searchBtn: document.getElementById("searchBtn"),
            searchResults: document.getElementById("searchResults"),
            geoBtn: document.getElementById("geoBtn"),
            filterHospital: document.getElementById("filterHospital"),
            filterClinic: document.getElementById("filterClinic"),
            filterPharmacy: document.getElementById("filterPharmacy")
        };

        this.init();
    }

    async init() {
        this.initMap();
        this.bindEvents();
        this.detectUserLocation();
        await this.reloadHospitals(this.DEFAULT_CENTER, "Pune");
    }

    initMap() {
        this.map = L.map(this.els.map, {
            zoomControl: true,
            preferCanvas: true
        }).setView([this.DEFAULT_CENTER.lat, this.DEFAULT_CENTER.lng], this.DEFAULT_ZOOM);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(this.map);

        this.map.addLayer(this.cluster);
    }

    bindEvents() {
        this.els.searchBtn.addEventListener("click", () => this.searchAndReload());
        this.els.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.searchAndReload();
        });

        this.els.searchInput.addEventListener("input", (e) => {
            const q = e.target.value.trim();
            clearTimeout(this.searchDebounce);
            if (q.length < 2) {
                this.hideSearchResults();
                return;
            }
            this.searchDebounce = setTimeout(() => this.searchSuggestions(q), 300);
        });

        this.els.geoBtn.addEventListener("click", () => this.detectUserLocation(true));

        this.els.filterHospital.addEventListener("change", () => this.applyFilters());
        this.els.filterClinic.addEventListener("change", () => this.applyFilters());
        this.els.filterPharmacy.addEventListener("change", () => this.applyFilters());

        this.map.on("click", () => this.hideSearchResults());
    }

    showLoading(show) {
        this.els.loadingSpinner.classList.toggle("hidden", !show);
    }

    setInfo(text) {
        this.els.mapInfo.textContent = text;
    }

    setListMeta(text) {
        this.els.listMeta.textContent = text;
    }

    async reloadHospitals(center, label = "selected area") {
        this.showLoading(true);
        this.setInfo(`Loading live data for ${label}...`);

        try {
            const elements = await this.fetchLiveData(center.lat, center.lng);
            this.hospitals = this.normalizeHospitals(elements);

            if (this.userLocation) {
                this.hospitals.forEach((h) => {
                    h.distanceKm = this.distanceKm(
                        this.userLocation.lat,
                        this.userLocation.lng,
                        h.lat,
                        h.lng
                    );
                });
            } else {
                this.hospitals.forEach((h) => {
                    h.distanceKm = null;
                });
            }

            this.render();

            if (this.hospitals.length === 0) {
                this.setInfo("No healthcare facilities found in this area.");
                this.setListMeta("0 results");
            } else {
                this.setInfo(`Loaded ${this.hospitals.length} live facilities from OpenStreetMap.`);
            }
        } catch (error) {
            console.error("Live Overpass fetch failed:", error);
            this.hospitals = [];
            this.render();
            this.setInfo("Live API failure. Please retry in a moment.");
            this.setListMeta("API unavailable");
        } finally {
            this.showLoading(false);
        }
    }

    async fetchLiveData(lat, lng) {
        const radiusMeters = 9000;

        const query = `
[out:json][timeout:25];
(
  node(around:${radiusMeters},${lat},${lng})["amenity"="hospital"];
  node(around:${radiusMeters},${lat},${lng})["amenity"="clinic"];
  node(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
);
out body;
`;

        const response = await fetch(this.OVERPASS_API, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
            throw new Error(`Overpass status ${response.status}`);
        }

        const data = await response.json();
        return data.elements || [];
    }

    normalizeHospitals(elements) {
        const rows = elements
            .map((el) => {
                if (!el.lat || !el.lon) return null;

                const tags = el.tags || {};
                const type = tags.amenity || "hospital";

                return {
                    id: `${type}-${el.id}`,
                    osmId: el.id,
                    type,
                    name: tags.name || tags.operator || this.fallbackName(type),
                    address: this.extractAddress(tags),
                    phone: tags.phone || tags["contact:phone"] || "Contact not available",
                    lat: el.lat,
                    lng: el.lon,
                    distanceKm: null
                };
            })
            .filter(Boolean)
            .filter((h) => ["hospital", "clinic", "pharmacy"].includes(h.type));

        const dedup = new Map();
        rows.forEach((h) => dedup.set(h.id, h));
        return Array.from(dedup.values());
    }

    fallbackName(type) {
        if (type === "clinic") return "Unnamed Clinic";
        if (type === "pharmacy") return "Unnamed Pharmacy";
        return "Unnamed Hospital";
    }

    extractAddress(tags) {
        const parts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"],
            tags["addr:city"]
        ].filter(Boolean);

        if (parts.length > 0) return parts.join(", ");
        if (tags["addr:full"]) return tags["addr:full"];
        return "Address not available";
    }

    applyFilters() {
        this.filters.hospital = this.els.filterHospital.checked;
        this.filters.clinic = this.els.filterClinic.checked;
        this.filters.pharmacy = this.els.filterPharmacy.checked;
        this.render();
    }

    getFilteredHospitals() {
        return this.hospitals
            .filter((h) => this.filters[h.type])
            .sort((a, b) => {
                const ad = a.distanceKm;
                const bd = b.distanceKm;
                if (ad === null && bd === null) return a.name.localeCompare(b.name);
                if (ad === null) return 1;
                if (bd === null) return -1;
                return ad - bd;
            });
    }

    render() {
        const filtered = this.getFilteredHospitals();
        this.renderMarkers(filtered);
        this.renderList(filtered);

        this.setListMeta(`${filtered.length} results`);
    }

    renderMarkers(hospitals) {
        this.cluster.clearLayers();
        this.markersById.clear();

        hospitals.forEach((h) => {
            const marker = this.createMarker(h);
            this.markersById.set(h.id, marker);
            this.cluster.addLayer(marker);
        });
    }

    createMarker(hospital) {
        const icon = L.divIcon({
            className: "",
            iconSize: [34, 34],
            html: `<div class="marker-icon ${hospital.type}-marker">${this.markerGlyph(hospital.type)}</div>`
        });

        const marker = L.marker([hospital.lat, hospital.lng], { icon });
        marker.bindPopup(this.popupHtml(hospital));

        marker.on("click", () => {
            this.selectHospital(hospital.id, false);
        });

        return marker;
    }

    markerGlyph(type) {
        if (type === "clinic") return "C";
        if (type === "pharmacy") return "P";
        return "H";
    }

    popupHtml(h) {
        return `
            <div class="popup-wrap">
                <div class="popup-title">${this.escape(h.name)}</div>
                <div class="popup-address">${this.escape(h.address)}</div>
                <button class="details-btn" onclick="window.mapManager.viewDetails('${this.escapeAttr(h.id)}')">View Details</button>
            </div>
        `;
    }

    viewDetails(id) {
        const h = this.hospitals.find((x) => x.id === id);
        if (!h) return;
        alert(`${h.name}\n${h.address}`);
    }

    renderList(hospitals) {
        if (hospitals.length === 0) {
            this.els.hospitalList.innerHTML = `
                <div class="empty-state">
                    <p>No hospitals found for current filters/area.</p>
                </div>
            `;
            return;
        }

        this.els.hospitalList.innerHTML = hospitals
            .map((h) => {
                const activeClass = this.selectedHospitalId === h.id ? "active" : "";
                const expandedClass = this.expandedCardIds.has(h.id) ? "expanded" : "";
                const expandLabel = this.expandedCardIds.has(h.id) ? "Hide Info" : "Show Info";
                return `
                    <article class="hospital-item ${activeClass} ${expandedClass}" data-id="${this.escapeAttr(h.id)}">
                        <div class="name">${this.escape(h.name)}</div>
                        <div class="meta">${this.escape(h.address)}</div>
                        <div class="distance">Distance: ${this.formatDistance(h.distanceKm)}</div>
                        <div class="actions">
                            <button class="expand-btn" data-expand="${this.escapeAttr(h.id)}">${expandLabel}</button>
                            <button class="locate-btn" data-locate="${this.escapeAttr(h.id)}">Locate on Map</button>
                        </div>
                        <div class="extra-info">
                            <div class="info-row">
                                <span class="label">Contact</span>
                                <span class="value">${this.escape(h.phone)}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Ratings</span>
                                <span class="value muted">Coming Soon</span>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");

        this.els.hospitalList.querySelectorAll("[data-expand]").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = e.currentTarget.getAttribute("data-expand");
                this.toggleCardExpansion(id);
            });
        });

        this.els.hospitalList.querySelectorAll("[data-locate]").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = e.currentTarget.getAttribute("data-locate");
                this.selectHospital(id, true);
            });
        });

        this.els.hospitalList.querySelectorAll(".hospital-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                if (e.target.closest("button")) return;
                const id = item.getAttribute("data-id");
                this.selectHospital(id, true);
            });
        });
    }

    toggleCardExpansion(id) {
        if (this.expandedCardIds.has(id)) {
            this.expandedCardIds.delete(id);
        } else {
            this.expandedCardIds.add(id);
        }
        this.renderList(this.getFilteredHospitals());
    }

    selectHospital(id, flyToMap) {
        this.selectedHospitalId = id;

        this.els.hospitalList.querySelectorAll(".hospital-item").forEach((n) => {
            n.classList.toggle("active", n.getAttribute("data-id") === id);
        });

        const selectedItem = this.els.hospitalList.querySelector(`.hospital-item[data-id="${id}"]`);
        if (selectedItem) {
            selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        const marker = this.markersById.get(id);
        if (marker) {
            if (flyToMap) this.map.flyTo(marker.getLatLng(), Math.max(this.map.getZoom(), 15), { duration: 0.7 });
            marker.openPopup();
        }
    }

    formatDistance(km) {
        if (km === null || Number.isNaN(km)) return "N/A";
        return `${km.toFixed(2)} km`;
    }

    distanceKm(lat1, lon1, lat2, lon2) {
        const toRad = (n) => (n * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async detectUserLocation(forceCenter = false) {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                this.userLocation = { lat, lng };

                if (this.userMarker) this.map.removeLayer(this.userMarker);

                const icon = L.divIcon({
                    className: "",
                    iconSize: [34, 34],
                    html: '<div class="marker-icon user-location-marker">U</div>'
                });

                this.userMarker = L.marker([lat, lng], { icon }).addTo(this.map).bindPopup("Your location");
                if (forceCenter) this.map.flyTo([lat, lng], 14, { duration: 0.7 });

                if (this.hospitals.length > 0) {
                    this.hospitals.forEach((h) => {
                        h.distanceKm = this.distanceKm(lat, lng, h.lat, h.lng);
                    });
                    this.render();
                }
            },
            () => {
                // Silent fallback: map still works without user location.
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    async searchSuggestions(query) {
        try {
            const url = `${this.NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
            const response = await fetch(url, {
                headers: { Accept: "application/json" }
            });
            if (!response.ok) throw new Error("Nominatim search failed");

            const results = await response.json();
            this.renderSearchResults(results);
        } catch (error) {
            console.error(error);
            this.hideSearchResults();
        }
    }

    renderSearchResults(results) {
        if (!results || results.length === 0) {
            this.els.searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            this.els.searchResults.classList.remove("hidden");
            return;
        }

        this.els.searchResults.innerHTML = results
            .map((r, i) => {
                const raw = r.display_name || "Selected location";
                const safe = this.escape(raw);
                return `
                    <div class="search-result-item" data-index="${i}">
                        <div class="search-result-name">${safe.split(",")[0]}</div>
                        <div class="search-result-desc">${safe}</div>
                    </div>
                `;
            })
            .join("");

        this.els.searchResults.classList.remove("hidden");

        this.els.searchResults.querySelectorAll(".search-result-item").forEach((item) => {
            item.addEventListener("click", () => {
                const index = Number(item.getAttribute("data-index"));
                const picked = results[index];
                this.onSearchLocationSelected(Number(picked.lat), Number(picked.lon), picked.display_name || "Selected location");
            });
        });
    }

    hideSearchResults() {
        this.els.searchResults.classList.add("hidden");
    }

    async searchAndReload() {
        const query = this.els.searchInput.value.trim();
        if (!query) return;

        this.showLoading(true);
        try {
            const url = `${this.NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const response = await fetch(url, {
                headers: { Accept: "application/json" }
            });
            if (!response.ok) throw new Error("Search failed");
            const results = await response.json();

            if (!results || results.length === 0) {
                this.setInfo("No location match found.");
                return;
            }

            const r = results[0];
            await this.onSearchLocationSelected(Number(r.lat), Number(r.lon), r.display_name || query);
        } catch (error) {
            console.error(error);
            this.setInfo("Search failed. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    async onSearchLocationSelected(lat, lng, label) {
        this.hideSearchResults();
        this.els.searchInput.value = label;

        this.map.flyTo([lat, lng], this.SEARCH_ZOOM, { duration: 0.7 });

        if (this.searchMarker) this.map.removeLayer(this.searchMarker);
        this.searchMarker = L.marker([lat, lng]).addTo(this.map).bindPopup("Search center");

        await this.reloadHospitals({ lat, lng }, label.split(",")[0]);
    }

    escape(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    escapeAttr(text) {
        return this.escape(text).replace(/`/g, "&#96;");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.mapManager = new MapManager();
});
