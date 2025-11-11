# Slither Security Analysis Server

This is a Flask backend server that provides Slither security analysis for Solidity smart contracts.

## Prerequisites

- Docker (recommended) OR
- Python 3.8+ with `flask`, `flask-cors`, and `slither-analyzer` installed
- Solidity compiler (`solc`) installed and in PATH

## Running with Docker (Recommended)

### Build and run in one command:
```bash
npm run slither-server-docker
```

### Or build and run separately:
```bash
# Build the Docker image
npm run slither-server-docker-build

# Run the container
npm run slither-server-docker-run
```

The server will be available at `http://localhost:5005`

## Running without Docker

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure `slither` and `solc` are installed and in your PATH

3. Run the server:
```bash
python app.py
```

Or use the npm script:
```bash
npm run slither-server
```

## API Endpoint

### POST `/analyze`

Analyzes Solidity code using Slither.

**Request:**
```json
{
  "code": "pragma solidity ^0.8.0; contract Test { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "slither_output": "...",
  "slither_errors": "..."
}
```

## Troubleshooting

- **"Failed to contact Slither backend"**: Make sure the Docker container is running (`npm run slither-server-docker-run`)
- **"[WinError 2] The system cannot find the file specified"**: Slither or solc is not installed in the Docker container. Rebuild the image.
- **Connection refused**: Check that the server is running on port 5005 and not blocked by firewall


