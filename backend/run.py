import uvicorn

if __name__ == "__main__":
    # Arrancar el servidor de desarrollo en http://127.0.0.1:8000 con recarga automática
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
