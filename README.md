# BadUSB Defense Dashboard

A minimal web dashboard for monitoring and controlling the BadUSB Defense system running on Raspberry Pi Pico.

## Features

- Real-time event monitoring
- Connection status indicator
- Statistics tracking (total events, blocked/allowed devices)
- Event log with color-coded messages
- Simple control interface

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Connect your Raspberry Pi Pico to your computer via USB
2. Make sure your Pico is running the BadUSB Defense firmware
3. Start the dashboard server:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

5. Click "Connect to Pico" to establish connection

## Project Structure

```
.
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Dashboard HTML
└── static/
    ├── style.css         # Dashboard styling
    └── script.js         # Frontend JavaScript
```

## Pico Communication

The dashboard communicates with the Pico via serial (USB Serial). The Pico should output events in the following format:

- Events containing "BLOCKED" or "DENIED" are marked as blocked devices
- Events containing "ALLOWED" or "PERMITTED" are marked as allowed devices
- All other events are logged as info messages

Adjust the parsing logic in `app.py` (in the `read_pico_data()` function) to match your Pico's output format.

## API Endpoints

- `GET /` - Main dashboard page
- `GET /api/status` - Get connection status
- `GET /api/events` - Get recent events and statistics
- `POST /api/connect` - Connect to Pico
- `POST /api/disconnect` - Disconnect from Pico
- `POST /api/send_command` - Send command to Pico (JSON body: `{"command": "your_command"}`)

## Notes

- The dashboard automatically detects Pico on common serial ports
- Events are kept in memory (last 100 events)
- The dashboard updates every second automatically

