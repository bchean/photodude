class PhotoModel:
    def __init__(self, db_util):
        self.db_util = db_util

    def _catch_exception_and_return_dict(function):
        def wrapper(*args, **kwargs):
            try:
                return function(*args, **kwargs)
            except Exception as e:
                return dict(error=str(e))
        return wrapper

    @_catch_exception_and_return_dict
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

    @_catch_exception_and_return_dict
    def insert_single_photo_if_not_present(self, filename):
        db = self.db_util.get_db()
        db.execute('insert or ignore into photos (filename) values (?)', [filename])
        db.commit()

        cur = db.execute('select changes()')
        is_new_photo = (cur.fetchone()[0] == 1)
        return dict(is_new_photo=is_new_photo)

    @_catch_exception_and_return_dict
    def update_single_photo(self, filename, description, date):
        db = self.db_util.get_db()
        db.execute('update photos set description = ?, date = ? where filename = ?', [description, date, filename])
        db.commit()
        return dict(success=True)
