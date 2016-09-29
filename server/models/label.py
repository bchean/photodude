from common import catch_exception_and_return_err_dict

class LabelModel:
    def __init__(self, db_util):
        self.db_util = db_util

    @staticmethod
    def make_dict_from_label_row(label_row):
        return dict(
            id=label_row['id'],
            name=label_row['name'],
            color=label_row['color'])

    @catch_exception_and_return_err_dict
    def get_all_labels(self):
        db = self.db_util.get_db()
        cur = db.execute('select * from labels')
        label_rows = cur.fetchall()
        labels = [self.make_dict_from_label_row(label_row) for label_row in label_rows]
        return labels

    @catch_exception_and_return_err_dict
    def get_all_labels_for_photo(self, photo_id):
        db = self.db_util.get_db()
        query = ('select labels.* from photos '
                 'inner join photolabels on photos.id = photolabels.photo_id '
                 'inner join labels on photolabels.label_id = labels.id '
                 'where photos.id = ?')
        cur = db.execute(query, [photo_id])
        label_rows = cur.fetchall()
        labels = [self.make_dict_from_label_row(label_row) for label_row in label_rows]
        return labels

    @catch_exception_and_return_err_dict
    def get_single_label(self, label_id):
        db = self.db_util.get_db()
        cur = db.execute('select name, color from labels where id = ?', [label_id])
        label_row = cur.fetchone()
        return self.make_dict_from_label_row(label_row)

    @catch_exception_and_return_err_dict
    def insert_single_label(self, name):
        db = self.db_util.get_db()
        cur = db.execute('insert into labels (name) values (?)', [name])
        db.commit()
        label_id = cur.lastrowid
        return dict(id=label_id, name=name, color=None)
