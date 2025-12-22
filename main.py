import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from waitlist import waitlist_bp


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
app.config["SECRET_KEY"] = "asdf#FGSgvasgf$5$WGT"

# Enable CORS for all routes
CORS(app)

app.register_blueprint(waitlist_bp, url_prefix="/api")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    """
    Serve the built static site with a graceful fallback to index.html.
    """
    if not app.static_folder:
        return "Static folder not configured", 404

    requested = os.path.join(app.static_folder, path)
    if path and os.path.exists(requested):
        return send_from_directory(app.static_folder, path)

    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, "index.html")

    return "index.html not found", 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
