
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

USER = {
    "username": "admin",
    "password": "1234"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if data["username"] == USER["username"] and data["password"] == USER["password"]:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

if __name__ == "__main__":
    app.run(debug=True)