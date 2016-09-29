var Backbone = require('backbone'),
    _ = require('underscore'),
    $ = require('jquery');

var dispatcher = _.extend({}, Backbone.Events);

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

var PhotoListItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'photoListItem',

  isSelected: false,

  events: {
    'click': 'fireClickPhoto'
  },

  render: function() {
    var modelData = this.model.toJSON();
    this.$el.html(
        modelData.filename + ' / ' +
        modelData.description + ' / '+
        modelData.date);
    return this;
  },

  fireClickPhoto: function() {
    dispatcher.trigger('click:photo', this.$el);
  }
})

var PhotoListView = Backbone.View.extend({
  el: '#photoList',

  // 1-based. We start at a dummy value for convenience.
  selectedIndex_1: null,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
    dispatcher.on('click:photo', this.handleClickPhoto, this);
  },

  render: function() {
    this.collection.each(function(photoModel) {
      var photoListItem = new PhotoListItemView({model: photoModel});
      this.$el.append(photoListItem.render().$el);
    }, this);
    return this;
  },

  handleClickPhoto: function($clickedPhoto) {
    var clickedIndex_0 = this.$el.children().index($clickedPhoto);
    console.log('clicked ' + clickedIndex_0);
    this.selectPhoto(clickedIndex_0);
  },

  selectPreviousPhoto: function() {
    var oldIndex_0 = this.selectedIndex_1 - 1;
    var newIndex_0 = oldIndex_0 - 1;
    this.selectPhoto(newIndex_0);
  },

  selectNextPhoto: function() {
    var oldIndex_0 = this.selectedIndex_1 - 1;
    var newIndex_0 = oldIndex_0 + 1;
    this.selectPhoto(newIndex_0);
  },

  selectFirstPhoto: function() {
    this.selectPhoto(0);
  },

  selectLastPhoto: function() {
    this.selectPhoto(this.collection.length-1);
  },

  selectPhoto: function(photoIndex_0) {
    if (!this.collection.length) {
      return;
    }

    // This will be false the first time this function is called (initial dummy value = 0).
    if (this.selectedIndex_1 >= 1) {
      this.$(':nth-child(' + this.selectedIndex_1 + ')').removeClass('selected');
    }

    photoIndex_0 = (photoIndex_0 + this.collection.length) % this.collection.length;
    var photoIndex_1 = photoIndex_0 + 1;
    var newPhotoIsHigher = (photoIndex_1 < this.selectedIndex_1);

    var $selectedPhoto = this.$(':nth-child(' + photoIndex_1 + ')');
    $selectedPhoto.addClass('selected');
    this.scrollIntoViewIfNecessary($selectedPhoto[0], newPhotoIsHigher);

    this.selectedIndex_1 = photoIndex_1;

    dispatcher.trigger('update:currentPhoto', this.collection.at(photoIndex_0));
  },

  scrollIntoViewIfNecessary: function(el, scrollingUp) {
    var elTop = el.getBoundingClientRect().top;
    var elBottom = el.getBoundingClientRect().bottom;
    var elIsInView = (elTop >= 0) && (elBottom <= window.innerHeight);
    if (!elIsInView) {
      el.scrollIntoView(scrollingUp);
    }
  }
})

var CurrentPhotoView = Backbone.View.extend({
  el: '#currentPhotoContainer',

  initialize: function() {
    dispatcher.on('update:currentPhoto', this.handleUpdateCurrentPhoto, this);
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

var CurrentPhotoLabelsView = Backbone.View.extend({
  el: '#currentPhotoContainer #labels',

  initialize: function() {
    dispatcher.on('update:currentPhoto', this.handleUpdateCurrentPhoto, this);
    this.listenTo(this.collection, 'sync', this.render);
  },

  render: function() {
    var labels = this.collection.map(function(labelModel) {
      return labelModel.get('name');
    });
    var labelStr = labels.join(', ');
    this.$el.html(labelStr || 'no labels yet');
    return this;
  },

  handleUpdateCurrentPhoto: function(newPhotoModel) {
    var newPhotoId = newPhotoModel.get('id');
    this.collection.fetch({data: {photo_id: newPhotoId}});
  }
})

var photoCollection = new PhotoCollection();
var photoListView = new PhotoListView({collection: photoCollection});
var currentPhotoView = new CurrentPhotoView({collection: photoCollection});

var labelCollection = new LabelCollection();
var currentPhotoLabelsView = new CurrentPhotoLabelsView({collection: labelCollection});

dispatcher.listenToOnce(photoCollection, 'sync', function() {
  if (photoCollection.length) {
    photoListView.selectFirstPhoto();
  }
});

document.onkeypress = function(e) {
  if (e.key === 'j') {
    photoListView.selectNextPhoto();
  } else if (e.key === 'k') {
    photoListView.selectPreviousPhoto();
  } else if (e.key === 'g') {
    photoListView.selectFirstPhoto();
  } else if (e.key === 'G') {
    photoListView.selectLastPhoto();
  }
};

photoCollection.fetch();
