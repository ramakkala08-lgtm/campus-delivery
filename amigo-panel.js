const STATE_KEY = AMIGO_ID === 'ram' ? AMIGO_RAM_KEY : AMIGO_KAPIL_KEY;
let currentState = getAmigoState(STATE_KEY);
let map, marker;
let watchId = null;

function init() {
    renderUI();
    initMap();
}

function initMap() {
    // Initialize map centered at current location or default
    map = L.map('driver-map', {
        zoomControl: false,
        attributionControl: false
    }).setView(currentState.location, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Custom Icon for Driver
    const icon = L.divIcon({
        className: 'custom-driver-marker',
        html: `
            <div class="navigation-marker">
                <div class="pulse"></div>
                <div class="label" id="marker-label">${currentState.name || 'Amigo'}</div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    marker = L.marker(currentState.location, { icon }).addTo(map);
    
    // Initial jump to real location if possible
    if ("geolocation" in navigator) {
        updateGPSStatus('Checking GPS...', 'searching');
        navigator.geolocation.getCurrentPosition(pos => {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            currentState.location = coords;
            if (marker) marker.setLatLng(coords);
            map.setView(coords, 16);
            updateGPSStatus('Location Ready', 'active');
            saveState();
        }, err => {
            console.log("Initial locate failed:", err);
            updateGPSStatus('GPS Check: Fail', 'info');
        });
    }
}


function renderUI() {
    document.getElementById('display-count').innerText = currentState.deliveryCount;
    document.getElementById('toggle-available').classList.toggle('active', currentState.isAvailable);
    document.getElementById('toggle-unavailable').classList.toggle('active', !currentState.isAvailable);

    const activities = ['idle', 'approaching', 'delivering'];
    activities.forEach(act => {
        document.getElementById(`act-${act}`).classList.toggle('active', currentState.activity === act);
    });

    document.getElementById('dest-input-group').style.display = currentState.activity === 'delivering' ? 'block' : 'none';
    if (currentState.activity === 'delivering' && document.getElementById('dest-input')) {
        document.getElementById('dest-input').value = currentState.destination || '';
    }

    const trackBtn = document.getElementById('btn-track');
    trackBtn.innerText = currentState.isTracking ? 'Stop Location Sharing' : 'Enable Location Sharing';
    trackBtn.style.background = currentState.isTracking ? 'var(--danger)' : 'var(--secondary)';

    // GPS Status update
    if (!currentState.isTracking) {
        updateGPSStatus('GPS: Inactive', 'info');
    }

    // Update Profile UI if exists
    if (document.getElementById('profile-name')) document.getElementById('profile-name').value = currentState.name || '';
    if (document.getElementById('profile-phone')) document.getElementById('profile-phone').value = currentState.phone || '';
    
    // Update Header and Page Title
    if (document.querySelector('header h1')) document.querySelector('header h1').innerText = `${currentState.name} Console`;
    document.title = `${currentState.name} Panel | Campus Delivery`;

    // Update Marker Label if map is initialized
    const markerLabel = document.getElementById('marker-label');
    if (markerLabel) markerLabel.innerText = currentState.name;
}

function setAvailability(val) {
    currentState.isAvailable = val;
    saveState();
}

function setActivity(act) {
    currentState.activity = act;
    if (act !== 'delivering') {
        currentState.destination = '';
    }
    saveState();
}

function incrementDelivery() {
    currentState.deliveryCount++;
    saveState();
}

function toggleTracking() {
    currentState.isTracking = !currentState.isTracking;
    
    if (currentState.isTracking) {
        if ("geolocation" in navigator) {
            updateGPSStatus('Requesting Permission...', 'searching');
            watchId = navigator.geolocation.watchPosition(pos => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                currentState.location = coords;
                if (marker) marker.setLatLng(coords);
                if (map) map.panTo(coords);
                updateGPSStatus('GPS: Active', 'active');
                saveState();
            }, err => {
                console.error("Tracking Error:", err);
                let msg = 'GPS Error';
                if (err.code === 1) msg = 'Permission Denied';
                if (err.code === 2) msg = 'Signal Unavailable';
                if (err.code === 3) msg = 'Connection Timeout';
                
                updateGPSStatus(`Error: ${msg}`, 'error');
                currentState.isTracking = false;
                saveState();
            }, { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0 
            });
        } else {
            updateGPSStatus('GPS Not Supported', 'error');
            currentState.isTracking = false;
        }
    } else {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    }
    saveState();
}

function updateGPSStatus(message, type) {
    const el = document.getElementById('gps-status');
    if (!el) return;
    
    el.innerText = message;
    el.className = 'gps-status ' + (type || '');
}

function saveState() {
    saveAmigoState(STATE_KEY, currentState);
    renderUI();
}

function updateProfile() {
    const nameInput = document.getElementById('profile-name');
    const phoneInput = document.getElementById('profile-phone');
    const statusMsg = document.getElementById('profile-status');

    if (nameInput) currentState.name = nameInput.value;
    if (phoneInput) currentState.phone = phoneInput.value;
    
    saveState();

    if (statusMsg) {
        statusMsg.style.display = 'block';
        setTimeout(() => statusMsg.style.display = 'none', 2000);
    }
}

document.addEventListener('DOMContentLoaded', init);
