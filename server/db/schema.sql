drop table if exists photos;
create table photos (
  id integer primary key,
  filename text not null unique,
  description text,
  date text
);

drop table if exists labels;
create table labels (
  id integer primary key,
  name text not null unique,
  color text
);

drop table if exists photolabels;
create table photolabels (
  id integer primary key,
  photo_id integer not null,
  label_id integer not null,
  foreign key(photo_id) references photos(id),
  foreign key(label_id) references labels(id),
  unique(photo_id, label_id)
);
