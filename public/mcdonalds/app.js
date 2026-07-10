const DATA_URL = "./big_mac_analysis.json";

const bandConfig = {
  cheapest_20: { label: "Cheapest 20%", color: "#158300" },
  low_20_40: { label: "20-40%", color: "#86b523" },
  middle_40_60: { label: "40-60%", color: "#d7ca39" },
  high_60_80: { label: "60-80%", color: "#f39a25" },
  highest_20: { label: "Most expensive 20%", color: "#b51d18" },
  missing: { label: "No Big Mac price", color: "#7d8288" },
};

const bandOrder = ["cheapest_20", "low_20_40", "middle_40_60", "high_60_80", "highest_20", "missing"];

const map = L.map("map", {
  zoomControl: false,
});
map.setView([56, -96], 4);
map.createPane("priceMarkers");
map.getPane("priceMarkers").style.zIndex = 650;

L.control.zoom({ position: "bottomleft" }).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 20,
}).addTo(map);

const markerByStore = new Map();
const visibleRowsByStore = new Map();

loadMap();

async function loadMap() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Could not load ${DATA_URL}: ${response.status}`);
  }
  const rows = await response.json();
  const validRows = rows.filter((row) => row.price_status === "ok" && row.big_mac_price);
  const missingRows = rows.filter((row) => row.map_color_group === "missing");
  const sortedPrices = [...validRows].sort((a, b) => Number(a.big_mac_price) - Number(b.big_mac_price));
  const cheapest = sortedPrices[0];
  const mostExpensive = sortedPrices[sortedPrices.length - 1];

  const markerLayer = L.layerGroup().addTo(map);
  const bounds = [];

  rows.forEach((row) => {
    const coordinates = coordinatesForRow(row);
    if (!coordinates) return;
    const latLng = L.latLng(coordinates[0], coordinates[1]);
    const color = bandConfig[row.map_color_group]?.color || bandConfig.missing.color;
    const marker = L.marker(latLng, {
      pane: "priceMarkers",
      icon: L.divIcon({
        className: "price-marker-shell",
        html: `<span class="price-marker-dot" style="background:${color}"></span>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    }).bindPopup(popupHtml(row));
    marker.addTo(markerLayer);
    markerByStore.set(row.store_id, marker);
    visibleRowsByStore.set(row.store_id, { row, latLng });
    bounds.push(latLng);
  });

  if (bounds.length) {
    map.fitBounds(bounds, {
      paddingTopLeft: [20, 120],
      paddingBottomRight: [20, 40],
    });
    setTimeout(() => map.invalidateSize(), 0);
  } else {
    map.setView([56, -96], 4);
  }
  document.getElementById("mapStatus").textContent = `${bounds.length.toLocaleString()} map points loaded`;

  renderCallout("cheapestCallout", "Cheapest", cheapest);
  renderCallout("expensiveCallout", "Most Expensive", mostExpensive);
  updateViewportExtremes(validRows);
  map.on("moveend zoomend", () => updateViewportExtremes(validRows));
  renderLegend(rows);
  renderStats(rows, validRows, missingRows);
  wireInsights();
}

function popupHtml(row) {
  const priceText = row.price_status === "ok" ? `$${row.big_mac_price}` : "No Big Mac price";
  const address = [row.address, row.city, row.province, row.postal_code].filter(Boolean).join(", ");
  return `
    <h3 class="popup-title">${escapeHtml(row.store_name || `Store ${row.store_id}`)}</h3>
    <p class="popup-price">${escapeHtml(priceText)}</p>
    <p class="popup-meta">${escapeHtml(address)}</p>
  `;
}

function coordinatesForRow(row) {
  if (!row.latitude || !row.longitude) return null;
  const latitude = Number(row.latitude);
  let longitude = Number(row.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (longitude >= 45 && longitude <= 145) {
    longitude = -longitude;
  }
  if (latitude < 40 || latitude > 85 || longitude < -145 || longitude > -45) {
    return null;
  }
  return [latitude, longitude];
}

function renderCallout(elementId, label, row) {
  const element = document.getElementById(elementId);
  const freshElement = element.cloneNode(false);
  if (!row) {
    freshElement.innerHTML = `<span>${label}: no priced stores in view</span>`;
    element.replaceWith(freshElement);
    return;
  }
  const address = [row.address, row.city, row.province].filter(Boolean).join(", ");
  freshElement.innerHTML = `<span>${label}: $${row.big_mac_price} (${escapeHtml(address)})</span>`;
  element.replaceWith(freshElement);
  freshElement.addEventListener("click", () => focusStore(row.store_id));
}

function updateViewportExtremes(fallbackRows) {
  const bounds = map.getBounds();
  const visiblePricedRows = [...visibleRowsByStore.values()]
    .filter(({ row, latLng }) => row.price_status === "ok" && row.big_mac_price && bounds.contains(latLng))
    .map(({ row }) => row)
    .sort((a, b) => Number(a.big_mac_price) - Number(b.big_mac_price));

  const pricedRows = visiblePricedRows.length
    ? visiblePricedRows
    : [...fallbackRows].sort((a, b) => Number(a.big_mac_price) - Number(b.big_mac_price));

  renderCallout("cheapestCallout", "Cheapest", pricedRows[0]);
  renderCallout("expensiveCallout", "Most Expensive", pricedRows[pricedRows.length - 1]);
}

function renderLegend(rows) {
  const counts = rows.reduce((acc, row) => {
    acc[row.map_color_group] = (acc[row.map_color_group] || 0) + 1;
    return acc;
  }, {});
  const ranges = rows.reduce((acc, row) => {
    if (!row.big_mac_price || row.price_status !== "ok") return acc;
    const key = row.map_color_group;
    const price = Number(row.big_mac_price);
    const range = acc[key] || { min: price, max: price };
    range.min = Math.min(range.min, price);
    range.max = Math.max(range.max, price);
    acc[key] = range;
    return acc;
  }, {});
  const container = document.getElementById("legendItems");
  container.innerHTML = bandOrder
    .map((key) => {
      const config = bandConfig[key];
      const range = ranges[key];
      const label = range ? `${config.label} <em>$${range.min.toFixed(2)}-$${range.max.toFixed(2)}</em>` : `${config.label} <em>No price</em>`;
      return `
        <div class="legend-row">
          <span class="legend-dot" style="background:${config.color}"></span>
          <span>${label}</span>
          <span class="legend-count">${counts[key] || 0}</span>
        </div>
      `;
    })
    .join("");
}

function renderStats(rows, validRows, missingRows) {
  const prices = validRows.map((row) => Number(row.big_mac_price));
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  document.getElementById("statStores").textContent = rows.length.toLocaleString();
  document.getElementById("statAverage").textContent = `$${average.toFixed(2)}`;
  document.getElementById("statRange").textContent = `$${Math.min(...prices).toFixed(2)}-$${Math.max(...prices).toFixed(2)}`;
  document.getElementById("statMissing").textContent = missingRows.length.toLocaleString();
}

function wireInsights() {
  const panel = document.getElementById("insightsPanel");
  const openButton = document.getElementById("insightsToggle");
  const closeButton = document.getElementById("closeInsights");
  openButton.addEventListener("click", () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    openButton.setAttribute("aria-expanded", String(!isOpen));
  });
  closeButton.addEventListener("click", () => {
    panel.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
  });
}

function focusStore(storeId) {
  const marker = markerByStore.get(String(storeId));
  if (!marker) return;
  map.setView(marker.getLatLng(), Math.max(map.getZoom(), 13), { animate: true });
  marker.openPopup();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
