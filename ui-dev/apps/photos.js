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
    click: 'fireUpdatePreview'
  },

  render: function() {
    var modelData = this.model.toJSON();
    this.$el.html(
        modelData.filename + ' / ' +
        modelData.description + ' / '+
        modelData.date);
    return this;
  },

  fireUpdatePreview: function() {
    dispatcher.trigger('update:preview', this.model);
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

var PhotoPreviewImageView = Backbone.View.extend({
  el: '#photoPreviewImage',

  initialize: function() {
    dispatcher.on('update:preview', this.handleUpdatePreview, this);

    this.listenToOnce(this.collection, 'sync', function() {
      if (this.collection.length) {
        this.handleUpdatePreview(this.collection.at(0));
      }
    });
  },

  render: function() {
    this.$el.attr('src', '/photo_files/' + this.currentPhotoModel.get('filename'));
    return this;
  },

  handleUpdatePreview: function(newPhotoModel) {
    this.currentPhotoModel = newPhotoModel;
    this.render();
  }
})

var photoCollection = new PhotoCollection();
var photoListView = new PhotoListView({collection: photoCollection});
var photoPreviewImageView = new PhotoPreviewImageView({collection: photoCollection});
photoCollection.fetch();
