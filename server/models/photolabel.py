from common import catch_exception_and_return_err_dict

class PhotolabelModel:
    def __init__(self, db_util):
        self.db_util = db_util

    @catch_exception_and_return_err_dict
    def insert_single_photolabel(self, photo_id, label_id):
        db = self.db_util.get_db()
        cur = db.execute('insert into photolabels (photo_id, label_id) values (?, ?)', [photo_id, label_id])
        db.commit()
        photolabel_id = cur.lastrowid
        return dict(id=photolabel_id, photo_id=photo_id, label_id=label_id)
