let updateInterval;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setupEventListeners();
    startAutoUpdate();
});

function setupEventListeners() {
    document.getElementById('connectBtn').addEventListener('click', connectToPico);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectFromPico);
    document.getElementById('testBtn').addEventListener('click', generateTestData);
    document.getElementById('clearBtn').addEventListener('click', clearLogs);
}

async function checkStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        updateConnectionStatus(data.connected);
        updatePortInfo(data);
    } catch (error) {
        console.error('Error checking status:', error);
        updateConnectionStatus(false);
    }
}

function updatePortInfo(data) {
    const portInfo = document.getElementById('portInfo');
    if (data.available_ports && data.available_ports.length > 0) {
        const portsList = data.available_ports.map(p => 
            `${p.device} - ${p.description || 'Unknown'}`
        ).join('<br>');
        portInfo.innerHTML = `<strong>Available Ports:</strong><br>${portsList}`;
        if (data.port) {
            portInfo.innerHTML += `<br><strong>Current Port:</strong> ${data.port}`;
        }
    } else {
        portInfo.innerHTML = '<strong>No serial ports found.</strong> Make sure your Pico is connected.';
    }
}

async function connectToPico() {
    try {
        const response = await fetch('/api/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updateConnectionStatus(true);
            addEvent('info', 'Connected to Raspberry Pi Pico');
        } else {
            alert('Failed to connect to Pico. Make sure it is plugged in.');
        }
    } catch (error) {
        console.error('Error connecting:', error);
        alert('Error connecting to Pico');
    }
}

async function disconnectFromPico() {
    try {
        const response = await fetch('/api/disconnect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updateConnectionStatus(false);
            addEvent('info', 'Disconnected from Raspberry Pi Pico');
        }
    } catch (error) {
        console.error('Error disconnecting:', error);
    }
}

function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    
    if (connected) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Connected';
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
        statusDot.className = 'status-dot disconnected';
        statusText.textContent = 'Disconnected';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    }
}

function startAutoUpdate() {
    updateInterval = setInterval(updateDashboard, 1000); // Update every second
    updateDashboard(); // Initial update
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}

async function updateDashboard() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        // Update statistics
        document.getElementById('totalEvents').textContent = data.stats.total_events || 0;
        document.getElementById('blockedDevices').textContent = data.stats.blocked_devices || 0;
        document.getElementById('allowedDevices').textContent = data.stats.allowed_devices || 0;
        document.getElementById('lastUpdate').textContent = data.stats.last_update || '--';
        
        // Update events log
        updateEventsLog(data.events);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateEventsLog(events) {
    const container = document.getElementById('eventsContainer');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="event-item info">
                <span class="event-time">--</span>
                <span class="event-message">Waiting for events...</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="event-item ${event.type}">
            <span class="event-time">${event.timestamp}</span>
            <span class="event-message">${escapeHtml(event.message)}</span>
        </div>
    `).reverse().join('');
}

function addEvent(type, message) {
    const container = document.getElementById('eventsContainer');
    const eventItem = document.createElement('div');
    eventItem.className = `event-item ${type}`;
    eventItem.innerHTML = `
        <span class="event-time">${new Date().toLocaleString()}</span>
        <span class="event-message">${escapeHtml(message)}</span>
    `;
    container.insertBefore(eventItem, container.firstChild);
    
    // Keep only last 50 events in DOM
    while (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
}

function clearLogs() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = `
        <div class="event-item info">
            <span class="event-time">--</span>
            <span class="event-message">Logs cleared</span>
        </div>
    `;
}

async function generateTestData() {
    try {
        const response = await fetch('/api/test_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            addEvent('info', 'Test data generated - check the event log');
            // Force update
            setTimeout(updateDashboard, 100);
        }
    } catch (error) {
        console.error('Error generating test data:', error);
        alert('Error generating test data');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

