
FROM python:3.10-slim


WORKDIR /app

COPY backend/ ./backend

RUN pip install --no-cache-dir -r backend/requirements.txt

COPY frontend/ ./frontend

ENV PORT=5000

CMD ["python", "backend/app.py"]