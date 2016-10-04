var Backbone = require('backbone'),
    _ = require('underscore'),
    $ = require('jquery'),
    MC = require('./mc');

var dispatcher = _.extend({}, Backbone.Events);

var PhotoListItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'photoListItem',

  isSelected: false,

  events: {
    'click': 'fireClickPhoto'
  },

  render: function() {
    var modelData = this.model.toJSON();
    this.$el.html(null);

    var $thumbnail = $('<img/>');
    $thumbnail.attr('src', '/photo_files/' + modelData.filename);
    $thumbnail.addClass('thumbnail');

    var $info = $('<span></span>');
    $info.html(
        modelData.filename + ' / ' +
        modelData.description + ' / '+
        modelData.date);

    this.$el.append($thumbnail);
    this.$el.append($info);

    return this;
  },

  fireClickPhoto: function() {
    dispatcher.trigger('click:photo', this.$el);
  }
});

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
});

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
});

var CurrentPhotoLabelsView = Backbone.View.extend({
  el: '#currentPhotoContainer #labelsContainer',
  events: {
    'click #addLabelButton': 'openAddLabelDialog'
  },

  initialize: function() {
    dispatcher.on('update:currentPhoto', this.handleUpdateCurrentPhoto, this);
    this.listenTo(this.collection, 'sync', this.render);
  },

  render: function() {
    this.$('#labels').html(null);
    var $labelLinks = this.collection.map(function(labelModel) {
      var labelLink = new CurrentPhotoLabelLinkView({model: labelModel});
      return labelLink.render().$el;
    });
    if ($labelLinks.length) {
      this.$('#labels').append($labelLinks);
    } else {
      this.$('#labels').html('no labels yet');
    }
    return this;
  },

  getLabels: function() {
    return this.collection.map(function(labelModel) {
      return labelModel.get('name');
    });
  },

  handleUpdateCurrentPhoto: function(newPhotoModel) {
    this.currentPhotoId = newPhotoModel.get('id');
    this.refresh();
  },

  refresh: function() {
    this.collection.fetch({data: {photo_id: this.currentPhotoId}});
  },

  openAddLabelDialog() {
    currentPhotoAddLabelModalView.show();
  },

  focus: function() {
    this.$('#addLabelButton').focus();
  }
});

var CurrentPhotoLabelLinkView = Backbone.View.extend({
  tagName: 'a',
  className: 'photoLabelLink',
  events: {
    'click': 'handleClick'
  },

  render: function() {
    this.$el.attr('href', '#');
    this.$el.html(this.model.get('name'));
    return this;
  },

  handleClick: function() {
    currentPhotoRemoveLabelModalView.show(this.model);
  }
});

var CurrentPhotoAddLabelModalView = Backbone.View.extend({
  el: '#addLabelModal',
  events: {
    'change #labelPicker': 'handleSelectLabel',
    'click #closeAddLabelModal': 'hide'
  },

  initialize: function() {
    dispatcher.on('update:currentPhoto', function(newPhotoModel) {
      this.model = newPhotoModel
    }, this);
    this.listenTo(labelCollection, 'sync', this.render);
  },

  render: function() {
    var $labelEls = labelCollection.map(function(labelModel) {
      var $labelEl = $('<option></option>');
      $labelEl.attr('value', labelModel.get('id'));
      $labelEl.html(labelModel.get('name'));
      return $labelEl;
    });

    var $labelPicker = this.$('#labelPicker');
    $labelPicker.html(null);
    $labelPicker.append($('<option value="none">---</option>'));
    $labelPicker.append($labelEls);

    return this;
  },

  show: function() {
    this.$('#labelPicker').val('none');
    this.$el.removeClass('hidden');
    this.$('#labelPicker').focus();
  },

  hide: function() {
    this.$el.addClass('hidden');
    currentPhotoLabelsView.focus();
  },

  handleSelectLabel: function() {
    var currentPhotoId = this.model.get('id');
    var selectedLabelId = this.$('#labelPicker').val();

    if (currentPhotoLabelsView.getLabels().indexOf(selectedLabelId) === -1) {
      new MC.PhotolabelModel({
        photo_id: currentPhotoId,
        label_id: selectedLabelId
      }).save();
    }

    this.hide();
    currentPhotoLabelsView.refresh();
  }
});

var CurrentPhotoRemoveLabelModalView = Backbone.View.extend({
  el: '#removeLabelModal',
  events: {
    'click #confirmLabelRemove': 'confirmLabelRemove',
    'click #closeAddLabelModal': 'hide'
  },

  initialize: function() {
    dispatcher.on('update:currentPhoto', function(newPhotoModel) {
      this.photoModel = newPhotoModel;
    }, this);
  },

  show: function(newLabelModel) {
    this.labelModel = newLabelModel;
    this.$('#labelToRemove').html(this.labelModel.get('name'));
    this.$el.removeClass('hidden');
    this.$('#confirmLabelRemove').focus();
  },

  hide: function() {
    this.$el.addClass('hidden');
    currentPhotoLabelsView.focus();
  },

  confirmLabelRemove: function() {
    var photolabelModel = new MC.PhotolabelModel();
    photolabelModel.fetch({
      data: {
        photo_id: this.photoModel.get('id'),
        label_id: this.labelModel.get('id')
      },
      success: function() {
        photolabelModel.destroy();
        currentPhotoLabelsView.refresh();
      }
    });

    this.hide();
  }
});

var photoCollection = new MC.PhotoCollection();
var labelCollection = new MC.LabelCollection();
var photoListView = new PhotoListView({collection: photoCollection});
var currentPhotoView = new CurrentPhotoView({collection: photoCollection});
var currentPhotoLabelsView = new CurrentPhotoLabelsView({collection: new MC.LabelCollection()});
var currentPhotoAddLabelModalView = new CurrentPhotoAddLabelModalView();
var currentPhotoRemoveLabelModalView = new CurrentPhotoRemoveLabelModalView();

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
  } else if (e.key === 'l') {
    currentPhotoAddLabelModalView.show();
  }
};

photoCollection.fetch();
labelCollection.fetch();
