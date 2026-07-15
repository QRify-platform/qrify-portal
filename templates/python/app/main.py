from fastapi import FastAPI

app = FastAPI(title="{{SERVICE_NAME}}")


@app.get("/health")
def health():
    return {"status": "ok", "service": "{{SERVICE_NAME}}"}


@app.get("/")
def root():
    return {
        "service": "{{SERVICE_NAME}}",
        "message": "Scaffolded by QRify Portal",
    }
