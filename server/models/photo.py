from common import catch_exception_and_return_err_dict

class PhotoModel:
    def __init__(self, db_util):
        self.db_util = db_util

    @staticmethod
    def make_dict_from_photo_row(photo_row):
        return dict(
            id=photo_row['id'],
            filename=photo_row['filename'],
            description=photo_row['description'],
            date=photo_row['date'])

    @catch_exception_and_return_err_dict
    def get_all_photos(self):
        db = self.db_util.get_db()
        cur = db.execute('select id, filename, description, date from photos')
        photo_rows = cur.fetchall()
        photos = [self.make_dict_from_photo_row(photo_row) for photo_row in photo_rows]
        return photos

    @catch_exception_and_return_err_dict
    def get_all_photos_for_label(self, label_id):
        db = self.db_util.get_db()
        query = ('select photos.* from labels '
                 'inner join photolabels on labels.id = photolabels.label_id '
                 'inner join photos on photolabels.photo_id = photos.id '
                 'where labels.id = ?')
        cur = db.execute(query, [label_id])
        photo_rows = cur.fetchall()
        photos = [self.make_dict_from_photo_row(photo_row) for photo_row in photo_rows]
        return photos

    @catch_exception_and_return_err_dict
    def insert_single_photo_if_not_present(self, filename):
        db = self.db_util.get_db()
        db.execute('insert or ignore into photos (filename) values (?)', [filename])
        db.commit()

        cur = db.execute('select changes()')
        is_new_photo = (cur.fetchone()[0] == 1)
        return dict(is_new_photo=is_new_photo)

    @catch_exception_and_return_err_dict
    def update_single_photo(self, filename, description, date):
        db = self.db_util.get_db()
        db.execute('update photos set description = ?, date = ? where filename = ?', [description, date, filename])
        db.commit()
        return dict(success=True)
