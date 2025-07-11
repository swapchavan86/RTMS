# Stage 1: Build the application
# Use an official Python runtime as the base image.
# We choose a slim-buster variant for a smaller image size.
FROM python:3.9-slim-buster

# Set the working directory inside the container.
# All subsequent commands will be executed relative to this directory.
# This means that inside the container, your 'app' folder will be at /app/app
WORKDIR /app

# Copy the requirements.txt file into the container's working directory.
# We copy it separately before the rest of the code to leverage Docker's build cache.
# If only the application code changes, but requirements.txt doesn't,
# Docker won't re-run the pip install command, speeding up builds.
# Since Dockerfile is in backend/, requirements.txt is also in backend/.
# So, we copy it from the build context root (where Dockerfile is).
COPY requirements.txt .

# Install the Python dependencies listed in requirements.txt.
# --no-cache-dir prevents pip from storing downloaded packages in a cache,
# which helps in reducing the final image size.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the 'app' directory (which contains main.py) into the container's working directory.
# The source 'app' here refers to the 'app' directory next to the Dockerfile in your backend folder.
# The destination './app' means it will be copied into the /app/app directory inside the container.
COPY app ./app

# Expose the port that your application will listen on.
# This is for documentation purposes and helps Docker tools understand which port to use.
# It does not actually publish the port; 'docker run -p' does that.
EXPOSE 8000

# Define environment variables (optional, but good practice for configuration).
# Many hosting platforms inject a PORT environment variable, so using $PORT is flexible.
ENV PORT=8000

# Command to run your application when the container starts.
# This part is crucial and depends on your specific Python web framework.
# Replace this with the appropriate command for your framework:

# --- Common CMD examples ---

# If you are using FastAPI (assuming your FastAPI app instance is named 'app' in 'main.py'):
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

# If you are using Flask (assuming your Flask app object is named 'app' in 'main.py'):
# If main.py directly runs the Flask app (e.g., app.run()):
# CMD ["python", "app/main.py"]
# For production Flask with Gunicorn (recommended):
# CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app.main:app"]
# (assuming your Flask app instance is named 'app' in 'main.py')

# If you are using Django (assuming your project is named 'your_project_name' and
# you have gunicorn in requirements.txt):
# CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app.your_project_name.wsgi:application"]
# (You might need to adjust 'app.your_project_name' based on your actual Django project structure)

# If it's a simple Python script that starts a server:
# CMD ["python", "app/main.py"]
