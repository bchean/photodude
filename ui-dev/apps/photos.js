var Backbone = require('backbone'),
    _ = require('underscore');

var dispatcher = _.extend({}, Backbone.Events);

var PhotoModel = Backbone.Model.extend({
  defaults: {
    filename: null,
    description: null,
    date: null
  }
});

var PhotoCollection = Backbone.Collection.extend({
  url: '/api/photos',
  model: PhotoModel
});

var PhotoListItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'photoListItem',

  events: {
    click: 'fireUpdateCurrentPhoto'
  },

  render: function() {
    var modelData = this.model.toJSON();
    this.$el.html(
        modelData.filename + ' / ' +
        modelData.description + ' / '+
        modelData.date);
    return this;
  },

  fireUpdateCurrentPhoto: function() {
    dispatcher.trigger('update:currentPhoto', this.model);
  }
})

var PhotoListView = Backbone.View.extend({
  el: '#photoList',

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
  },

  render: function() {
    this.collection.each(function(photoModel) {
      var photoListItem = new PhotoListItemView({model: photoModel});
      this.$el.append(photoListItem.render().$el);
    }, this);
    return this;
  }
})

var CurrentPhotoView = Backbone.View.extend({
  el: '#currentPhotoContainer',

  initialize: function() {
    dispatcher.on('update:currentPhoto', this.handleUpdateCurrentPhoto, this);

    this.listenToOnce(this.collection, 'sync', function() {
      if (this.collection.length) {
        this.handleUpdateCurrentPhoto(this.collection.at(0));
      }
    });
  },

  render: function() {
    var modelData = this.currentPhotoModel.toJSON();
    this.$('#image').attr('src', '/photo_files/' + modelData.filename);
    this.$('#description').html(modelData.description || 'no description yet');
    this.$('#date').html(modelData.date || 'no date yet');
    return this;
  },

  handleUpdateCurrentPhoto: function(newPhotoModel) {
    this.currentPhotoModel = newPhotoModel;
    this.render();
  }
})

var photoCollection = new PhotoCollection();
var photoListView = new PhotoListView({collection: photoCollection});
var currentPhotoView = new CurrentPhotoView({collection: photoCollection});
photoCollection.fetch();
