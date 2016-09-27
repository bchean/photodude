import os
import sys
from flask import Flask
from flask import flash
from flask import g
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request

from db.sqlite import SQLiteUtil
from models.photo import PhotoModel

app = Flask(__name__)
app.config.update(dict(
    DATABASE_FILE=os.path.join(app.root_path, 'db/database.db'),
    SCHEMA_FILE=os.path.join(app.root_path, 'db/schema.sql')
))
app.config.from_envvar('FLASK_CONFIG')

db_util = SQLiteUtil(app)
photo_model = PhotoModel(db_util)

###############
### VIEW ROUTES
###############

@app.route('/')
def view_index():
    return render_template('index.html')

@app.route('/photos')
def view_photos():
    return render_template('photos.html')

##############
### API ROUTES
##############

@app.route('/api/photos', methods=['GET'])
def api_get_all_photos():
    result = photo_model.get_all_photos()
    return jsonify(result)

####################
### OTHER APP CONFIG
####################

@app.teardown_appcontext
def close_db(error):
    db_util.close_db()

@app.cli.command('initdb')
def cmd_initdb():
    db_util.init_db_if_necessary()

@app.cli.command('refreshphotos')
def cmd_refreshphotos():
    photo_dir = app.config['PHOTO_DIR']
    for path in os.listdir(photo_dir):
        if is_photo_file(path):
            result = photo_model.put_single_photo(path)
            if 'error' in result:
                sys.stderr.write(str(result) + '\n')

def is_photo_file(path):
    photo_dir = app.config['PHOTO_DIR']
    photo_file_extensions = ['jpg', 'jpeg', 'gif', 'png']
    extension = path[path.find('.')+1:].lower()
    return os.path.isfile(os.path.join(photo_dir, path)) and extension in photo_file_extensions

if __name__ == '__main__':
    app.run()
