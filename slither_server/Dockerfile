FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y wget git curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install solc static binary (v0.8.24)
RUN wget https://github.com/ethereum/solidity/releases/download/v0.8.24/solc-static-linux -O /tmp/solc && \
    chmod +x /tmp/solc && \
    mv /tmp/solc /usr/local/bin/solc && \
    solc --version

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . ./

EXPOSE 5005

CMD ["python", "app.py"]



