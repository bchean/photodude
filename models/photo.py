class PhotoModel:
    def __init__(self, db_util):
        self.db_util = db_util

    def get_all_photos(self):
        db = self.db_util.get_db()
        cur = db.execute('select filename from photos')
        photo_rows = cur.fetchall()
        photos = [dict(filename=photo_row['filename']) for photo_row in photo_rows]
        return photos

    def put_single_photo(self, filename):
        db = self.db_util.get_db()
        try:
            db.execute('insert or ignore into photos (filename) values (?)', [filename])
            db.commit()
            return dict(filename=filename)
        except Exception as e:
            return dict(error=str(e))
