const AMIGO_RAM_KEY = 'amigo_ram_state';
const AMIGO_KAPIL_KEY = 'amigo_kapil_state';

// Step 3: Specific Test Coordinates as requested
const TEST_COORDS = {
    START: [17.9837, 79.5300],
    END: [17.9900, 79.5400],
    GATE: [17.9837, 79.5300], // Using start as gate
    DEST_A: [17.9900, 79.5400], // Using end as dest A
    DEST_B: [17.9870, 79.5350]
};

const INITIAL_STATE = {
    isAvailable: true,
    activity: 'idle', 
    destination: '',
    deliveryCount: 0,
    location: TEST_COORDS.START,
    isTracking: false,
    phone: '918800000000',
    name: 'Amigo' // Generic default
};

function getAmigoState(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { 
        ...INITIAL_STATE, 
        location: TEST_COORDS.START,
        phone: key === AMIGO_RAM_KEY ? '919000000001' : '919000000002',
        name: key === AMIGO_RAM_KEY ? 'Amigo Ram' : 'Amigo Kapil'
    };
}

function saveAmigoState(key, state) {
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new Event('storage'));
}
