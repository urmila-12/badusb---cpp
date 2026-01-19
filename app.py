from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import serial
import serial.tools.list_ports
import threading
import time
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Global variables for Pico communication
pico_serial = None
pico_connected = False
detected_events = []
stats = {
    'total_events': 0,
    'blocked_devices': 0,
    'allowed_devices': 0,
    'last_update': None
}

def find_pico_port():
    """Find the serial port for Raspberry Pi Pico"""
    ports = serial.tools.list_ports.comports()
    for port in ports:
        # Common identifiers for Pico
        if 'Pico' in port.description or 'USB Serial' in port.description or 'CDC' in port.description:
            return port.device
    return None

def connect_to_pico():
    """Connect to Raspberry Pi Pico via serial"""
    global pico_serial, pico_connected
    try:
        port = find_pico_port()
        if port:
            pico_serial = serial.Serial(port, 115200, timeout=1)
            pico_connected = True
            print(f"Connected to Pico on {port}")
            return True
        else:
            print("Pico not found")
            return False
    except Exception as e:
        print(f"Error connecting to Pico: {e}")
        pico_connected = False
        return False

def read_pico_data():
    """Read data from Pico in background thread"""
    global detected_events, stats, pico_connected
    while True:
        if pico_serial and pico_connected:
            try:
                if pico_serial.in_waiting > 0:
                    line = pico_serial.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        # Parse Pico output (adjust based on your Pico's output format)
                        event = {
                            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'message': line,
                            'type': 'info'
                        }
                        
                        # Detect event types
                        if 'BLOCKED' in line.upper() or 'DENIED' in line.upper():
                            event['type'] = 'blocked'
                            stats['blocked_devices'] += 1
                        elif 'ALLOWED' in line.upper() or 'PERMITTED' in line.upper():
                            event['type'] = 'allowed'
                            stats['allowed_devices'] += 1
                        
                        detected_events.append(event)
                        stats['total_events'] += 1
                        stats['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        
                        # Keep only last 100 events
                        if len(detected_events) > 100:
                            detected_events.pop(0)
            except Exception as e:
                print(f"Error reading from Pico: {e}")
                pico_connected = False
        time.sleep(0.1)

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    """Get connection status"""
    return jsonify({
        'connected': pico_connected,
        'port': find_pico_port()
    })

@app.route('/api/events')
def get_events():
    """Get recent events"""
    return jsonify({
        'events': detected_events[-50:],  # Last 50 events
        'stats': stats
    })

@app.route('/api/connect', methods=['POST'])
def connect():
    """Connect to Pico"""
    global pico_connected
    success = connect_to_pico()
    return jsonify({'success': success, 'connected': pico_connected})

@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    """Disconnect from Pico"""
    global pico_serial, pico_connected
    if pico_serial:
        pico_serial.close()
        pico_serial = None
    pico_connected = False
    return jsonify({'success': True, 'connected': False})

@app.route('/api/send_command', methods=['POST'])
def send_command():
    """Send command to Pico"""
    global pico_serial, pico_connected
    if not pico_connected or not pico_serial:
        return jsonify({'success': False, 'error': 'Not connected to Pico'})
    
    try:
        data = request.json
        command = data.get('command', '')
        pico_serial.write(f"{command}\n".encode())
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    # Start background thread for reading Pico data
    pico_thread = threading.Thread(target=read_pico_data, daemon=True)
    pico_thread.start()
    
    # Try to auto-connect
    connect_to_pico()
    
    print("Starting BadUSB Defense Dashboard...")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)

