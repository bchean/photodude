var Backbone = require('backbone');

var PhotoModel = Backbone.Model.extend({
  defaults: {
    filename: null,
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

  render: function() {
    var modelData = this.model.toJSON();
    this.$el.html(modelData.filename + ' / ' + modelData.date);
    return this;
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

var photoCollection = new PhotoCollection();
var photoListView = new PhotoListView({collection: photoCollection});
photoCollection.fetch();
