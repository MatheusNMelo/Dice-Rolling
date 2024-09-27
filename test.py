from flask import Flask, request, jsonify, render_template

# from flask_sqlalchemy import SQLAlchemy

from flask_restful import Resource, Api


app = Flask(
    __name__,
)

api = Api(app)


@app.route("/")
def hello():
    return render_template("index.html")


@app.route("/about/")
def about():
    return render_template("about.html")


if __name__ == "__main__":
    app.run(debug=True)
