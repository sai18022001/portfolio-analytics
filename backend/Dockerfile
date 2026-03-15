# Dockerfile — instructions for building the backend container image
#
# What is a Docker image? Think of it as a snapshot of a complete environment:
# Python 3.11 + all your pip packages + your code — all bundled together.
# Anyone can run this image and get the exact same environment, on any machine.

# Start from the official Python 3.11 slim image (slim = smaller size)
FROM python:3.13-slim

# Set the working directory inside the container
# All subsequent commands run from this folder
WORKDIR /app

# Copy requirements first — before copying your code.
# Why? Docker caches each step. If you copy requirements first and they
# haven't changed, Docker skips reinstalling packages — much faster builds.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy your actual application code
COPY app/ ./app/

# Tell Docker this container listens on port 8000
EXPOSE 8080

# Command to start the server when the container runs
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]