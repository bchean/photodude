import os
import sqlite3
from flask import g

class SQLiteUtil:
    def __init__(self, app):
        self.app = app

    def connect_to_db(self):
        conn = sqlite3.connect(self.app.config['DATABASE_FILE'])
        conn.row_factory = sqlite3.Row
        return conn

    def get_db(self):
        if not hasattr(g, 'sqlite_db'):
            g.sqlite_db = self.connect_to_db()
        return g.sqlite_db

    def init_db(self):
        db = self.get_db()
        schema_file = self.app.config['SCHEMA_FILE']
        with self.app.open_resource(schema_file, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

    def init_db_if_necessary(self):
        db_file = self.app.config['DATABASE_FILE']
        if os.path.isfile(db_file):
            print 'Database has already been initialized at %s.' % db_file
        else:
            self.init_db()
            print 'Initialized database at %s.' % db_file

    def close_db(self):
        if hasattr(g, 'sqlite_db'):
            g.sqlite_db.close()
