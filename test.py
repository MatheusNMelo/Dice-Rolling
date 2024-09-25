import sqlite3
import requests
from flask import Flask, request, jsonify, render_template

# from flask_sqlalchemy import SQLAlchemy

from flask_restful import Resource, Api


app = Flask(
    __name__,
)

api = Api(app)


def get_db_connection():
    conn = sqlite3.connect("tcc.db")
    conn.row_factory = sqlite3.Row
    return conn


def get_external_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None


LAST_PULSE = "https://beacon.nist.gov/beacon/2.0/pulse/last"
data = get_external_data(LAST_PULSE)
if data:
    conn = get_db_connection()
    cur = conn.cursor()

    uri = data["uri"]
    cipherSuite = data["age"]
    period = data["age"]
    certificateId = data["age"]
    chainIndex = data["age"]
    version = data["age"]
    version = data["age"]

    cur.execute("INSERT INTO pulses (name, age) VALUES (?, ?)", (name, age))
    conn.commit()

    cur.close()
    conn.close()

uri text NOT NULL, version text NOT NULL, cipherSuite integer NOT NULL, period integer NOT NULL, certificateId text NOT NULL, chainIndex integer NOT NULL, pulseIndex integer NOT NULL, timeStamp text NOT NULL, localRandomValue text NOT NULL, external blob NOT NULL, listValues blob NOT NULL, precommitmentValue text NOT NULL, statusC
ode integer NOT NULL, signatureValue text NOT NULL, outputValue

@app.route("/")
def hello():
    return render_template("index.html")


@app.route("/about/")
def about():
    return render_template("about.html")


if __name__ == "__main__":
    app.run(debug=True)
