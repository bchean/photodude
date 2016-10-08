from common import catch_exception_and_return_err_dict

class PhotolabelModel:
    def __init__(self, db_util):
        self.db_util = db_util

    @staticmethod
    def make_dict_from_photolabel_row(photolabel_row):
        return dict(
            id=photolabel_row['id'],
            photo_id=photolabel_row['photo_id'],
            label_id=photolabel_row['label_id'])

    @catch_exception_and_return_err_dict
    def get_all_photolabels(self):
        conn = self.db_util.get_db_conn()
        cur = conn.execute('select id, photo_id, label_id from photolabels')
        photolabel_rows = cur.fetchall()
        photolabels = [self.make_dict_from_photolabel_row(photolabel_row) for photolabel_row in photolabel_rows]
        return photolabels

    @catch_exception_and_return_err_dict
    def get_single_photolabel(self, photo_id, label_id):
        conn = self.db_util.get_db_conn()
        cur = conn.execute('select id from photolabels where photo_id = ? and label_id = ?', [photo_id, label_id])
        photolabel_id = cur.fetchone()[0]
        return dict(id=photolabel_id, photo_id=photo_id, label_id=label_id)

    @catch_exception_and_return_err_dict
    def insert_single_photolabel(self, photo_id, label_id):
        conn = self.db_util.get_db_conn()
        cur = conn.execute('insert into photolabels (photo_id, label_id) values (?, ?)', [photo_id, label_id])
        conn.commit()
        photolabel_id = cur.lastrowid
        return dict(id=photolabel_id, photo_id=photo_id, label_id=label_id)

    @catch_exception_and_return_err_dict
    def delete_single_photolabel(self, photolabel_id):
        conn = self.db_util.get_db_conn()
        cur = conn.execute('delete from photolabels where id = ?', [photolabel_id])
        conn.commit()
        return dict()
