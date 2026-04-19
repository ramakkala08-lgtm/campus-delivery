let maps = { ram: null, kapil: null };
let markers = { ram: null, kapil: null };

function init() {
    setupMaps();
    updateUI();
    
    window.addEventListener('storage', updateUI);
    setInterval(updateUI, 2000);
}

function setupMaps() {
    ['ram', 'kapil'].forEach(id => {
        const key = id === 'ram' ? AMIGO_RAM_KEY : AMIGO_KAPIL_KEY;
        const state = getAmigoState(key);
        
        maps[id] = L.map(`map-${id}`, {
            zoomControl: false,
            attributionControl: false
        }).setView(state.location, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(maps[id]);

        const icon = L.divIcon({
            className: 'custom-driver-marker',
            html: `
                <div class="navigation-marker">
                    <div class="pulse"></div>
                    <div class="label" id="marker-label-${id}">${state.name || 'Amigo'}</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        markers[id] = L.marker(state.location, { icon }).addTo(maps[id]);
    });
}

function updateUI() {
    ['ram', 'kapil'].forEach(id => {
        const key = id === 'ram' ? AMIGO_RAM_KEY : AMIGO_KAPIL_KEY;
        const state = getAmigoState(key);
        
        const statusBadge = document.getElementById(`status-${id}`);
        const reqBtn = document.getElementById(`btn-${id}`);
        if (state.isAvailable) {
            statusBadge.innerText = 'Available';
            statusBadge.className = 'status-badge status-available';
            reqBtn.disabled = false;
        } else {
            statusBadge.innerText = 'Busy / Off';
            statusBadge.className = 'status-badge status-busy';
            reqBtn.disabled = true;
        }

        document.getElementById(`count-${id}`).innerText = state.deliveryCount;
        const activityText = document.getElementById(`activity-${id}`);
        
        if (state.activity === 'idle') {
            activityText.innerText = 'Waiting at Gate';
        } else if (state.activity === 'approaching') {
            activityText.innerText = 'Approaching Main Gate';
        } else if (state.activity === 'delivering') {
            activityText.innerText = `Delivering to ${state.destination || 'Destination'}`;
        }

        // Update Marker Position
        if (markers[id] && state.location) {
            markers[id].setLatLng(state.location);
        }

        // Update Dynamic Names in UI
        const section = document.getElementById(`section-${id}`);
        if (section) {
            const nameHeader = section.querySelector('.amigo-name h2');
            if (nameHeader) nameHeader.innerText = state.name;
            
            const mapLabel = section.querySelector('.map-label');
            if (mapLabel) mapLabel.innerText = `LIVE: ${state.name}`;
        }
        
        const markerLabel = document.getElementById(`marker-label-${id}`);
        if (markerLabel) markerLabel.innerText = state.name;
    });
}

function openRequestModal(id) {
    activeAmigo = id;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function handleRequest(event) {
    event.preventDefault();
    const name = document.getElementById('user-name').value;
    const platform = document.getElementById('platform').value;
    const dest = document.getElementById('destination').value;
    const key = activeAmigo === 'ram' ? AMIGO_RAM_KEY : AMIGO_KAPIL_KEY;
    const state = getAmigoState(key);
    
    const message = `*CAMPUS DELIVERY*%0A*From:* ${name}%0A*Platform:* ${platform}%0A*To:* ${dest}%0A%0APlease confirm pickup.`;
    window.open(`https://wa.me/${state.phone}?text=${message}`, '_blank');
    
    document.getElementById('request-form').style.display = 'none';
    document.getElementById('success-msg').style.display = 'block';
    setTimeout(closeModal, 2000);
}

document.addEventListener('DOMContentLoaded', init);
