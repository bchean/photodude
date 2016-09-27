drop table if exists photos;
create table photos (
  id integer primary key,
  filename text not null unique,
  date text
);

drop table if exists labels;
create table labels (
  id integer primary key,
  name text not null,
  color text not null
);

drop table if exists pl_mappings;
create table pl_mappings (
  id integer primary key,
  photo_id integer not null,
  label_id integer not null,
  foreign key(photo_id) references photos(id),
  foreign key(label_id) references labels(id)
);
