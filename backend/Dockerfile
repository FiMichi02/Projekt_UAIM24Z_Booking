FROM python:3.9-slim

# Install dependencies
COPY requirements.txt /app/
WORKDIR /app
RUN pip install -r requirements.txt

# Skopiowanie plików aplikacji
COPY . /app

# Ustawienie zmiennej środowiskowej PYTHONPATH
ENV PYTHONPATH=/app

EXPOSE 5000

# Uruchomienie aplikacji
CMD ["python", "app/run.py"]

