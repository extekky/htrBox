# =============================================
# Base
# =============================================

FROM python:3.11-slim

# Setup the working directory inside the container
WORKDIR /app

# =============================================
# Installing dependencies
# =============================================

# First, we copy only requirements.txt to make better use of the Docker cache
COPY requirements.txt .

# Installing Python dependencies without pip cache (to reduce image size)
RUN pip install --no-cache-dir -r requirements.txt

# =============================================
# Copying the application source code
# =============================================

# Copy the source code folder
COPY source/ .

# Copying the uvicorn logging configuration
COPY uvicorn_log_config.json .

# =============================================
# Start app
# =============================================

# Launching the FastAPI application via Uvicorn
CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--log-config", "uvicorn_log_config.json"]