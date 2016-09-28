class PhotoModel:
    def __init__(self, db_util):
        self.db_util = db_util

    def get_all_photos(self):
        db = self.db_util.get_db()
        cur = db.execute('select filename, description, date from photos')
        photo_rows = cur.fetchall()
        photos = [self._make_dict_from_photo_row(photo_row) for photo_row in photo_rows]
        return photos

    def _make_dict_from_photo_row(self, photo_row):
        return dict(
            filename=photo_row['filename'],
            description=photo_row['description'],
            date=photo_row['date'])

    def put_single_photo(self, filename):
        db = self.db_util.get_db()
        try:
            db.execute('insert or ignore into photos (filename) values (?)', [filename])
            db.commit()

            cur = db.execute('select changes()')
            is_new_photo = (cur.fetchone()[0] == 1)

            return dict(is_new_photo=is_new_photo)
        except Exception as e:
            return dict(error=str(e))
