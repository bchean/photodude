var Backbone = require('backbone');

var PhotoModel = Backbone.Model.extend({
  defaults: {
    id: null,
    filename: null,
    description: null,
    date: null
  }
});

var PhotoCollection = Backbone.Collection.extend({
  url: '/api/photos',
  model: PhotoModel
});

var LabelModel = Backbone.Model.extend({
  defaults: {
    id: null,
    name: null,
    color: null
  }
});

var LabelCollection = Backbone.Collection.extend({
  url: '/api/labels',
  model: LabelModel
});

module.exports = {
  PhotoModel: PhotoModel,
  PhotoCollection: PhotoCollection,
  LabelModel: LabelModel,
  LabelCollection: LabelCollection
};
