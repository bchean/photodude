#!/bin/sh

source venv/bin/activate
export FLASK_APP=server.py
export FLASK_DEBUG=1
export FLASK_CONFIG=config.py

flask initdb
flask refreshphotos
flask run
