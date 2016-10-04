var Backbone = require('backbone');

var PhotoModel = Backbone.Model.extend({});

var PhotoCollection = Backbone.Collection.extend({
  url: '/api/photos',
  model: PhotoModel
});

var LabelModel = Backbone.Model.extend({});

var LabelCollection = Backbone.Collection.extend({
  url: '/api/labels',
  model: LabelModel
});

var PhotolabelModel = Backbone.Model.extend({
  urlRoot: '/api/photolabels/'
});

module.exports = {
  PhotoModel: PhotoModel,
  PhotoCollection: PhotoCollection,
  LabelModel: LabelModel,
  LabelCollection: LabelCollection,
  PhotolabelModel: PhotolabelModel
};
