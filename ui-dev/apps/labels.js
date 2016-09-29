var Backbone = require('backbone'),
    _ = require('underscore'),
    $ = require('jquery'),
    MC = require('./mc');

var dispatcher = _.extend({}, Backbone.Events);

var LabelListItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'labelListItem',

  isSelected: false,

  events: {
    'click': 'fireClickLabel'
  },

  render: function() {
    var labelData = this.model.toJSON();
    this.$el.html(
        labelData.name + ' / ' +
        labelData.color);
    return this;
  },

  fireClickLabel: function() {
    dispatcher.trigger('click:label', this.$el);
  }
});

var LabelListView = Backbone.View.extend({
  el: '#labelList',

  // 1-based. We start at a dummy value for convenience.
  selectedIndex_1: null,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
    dispatcher.on('click:label', this.handleClickLabel, this);
  },

  render: function() {
    this.collection.each(function(labelModel) {
      var labelListItem = new LabelListItemView({model: labelModel});
      this.$el.append(labelListItem.render().$el);
    }, this);
    return this;
  },

  handleClickLabel: function($clickedLabel) {
    var clickedIndex_0 = this.$el.children().index($clickedLabel);
    this.selectLabel(clickedIndex_0);
  },

  selectPreviousLabel: function() {
    var oldIndex_0 = this.selectedIndex_1 - 1;
    var newIndex_0 = oldIndex_0 - 1;
    this.selectLabel(newIndex_0);
  },

  selectNextLabel: function() {
    var oldIndex_0 = this.selectedIndex_1 - 1;
    var newIndex_0 = oldIndex_0 + 1;
    this.selectLabel(newIndex_0);
  },

  selectFirstLabel: function() {
    this.selectLabel(0);
  },

  selectLastLabel: function() {
    this.selectLabel(this.collection.length-1);
  },

  selectLabel: function(labelIndex_0) {
    if (!this.collection.length) {
      return;
    }

    // This will be false the first time this function is called (initial dummy value = 0).
    if (this.selectedIndex_1 >= 1) {
      this.$(':nth-child(' + this.selectedIndex_1 + ')').removeClass('selected');
    }

    labelIndex_0 = (labelIndex_0 + this.collection.length) % this.collection.length;
    var labelIndex_1 = labelIndex_0 + 1;
    var newLabelIsHigher = (labelIndex_1 < this.selectedIndex_1);

    var $selectedLabel = this.$(':nth-child(' + labelIndex_1 + ')');
    $selectedLabel.addClass('selected');
    this.scrollIntoViewIfNecessary($selectedLabel[0], newLabelIsHigher);

    this.selectedIndex_1 = labelIndex_1;

    dispatcher.trigger('update:currentLabel', this.collection.at(labelIndex_0));
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

var CurrentLabelPhotosView = Backbone.View.extend({
  el: '#currentLabelContainer #imagesContainer',

  initialize: function() {
    dispatcher.on('update:currentLabel', this.handleUpdateCurrentLabel, this);
    this.listenTo(this.collection, 'sync', this.render);
  },

  render: function() {
    if (!this.collection.length) {
      this.$el.html('no photos yet');
    } else {
      this.$el.html(null);
      this.collection.each(function(photoModel) {
        var $photoImageEl = $('<img/>');
        $photoImageEl.addClass('image');
        $photoImageEl.attr('src', '/photo_files/' + photoModel.get('filename'));
        this.$el.append($photoImageEl);
      }, this);
    }
    return this;
  },

  handleUpdateCurrentLabel: function(newLabelModel) {
    var newLabelId = newLabelModel.get('id');
    this.collection.fetch({data: {label_id: newLabelId}});
  }
});

var labelCollection = new MC.LabelCollection();
var labelListView = new LabelListView({collection: labelCollection});
var photoCollection = new MC.PhotoCollection();
var currentLabelPhotosView = new CurrentLabelPhotosView({collection: photoCollection});

dispatcher.listenToOnce(labelCollection, 'sync', function() {
  if (labelCollection.length) {
    labelListView.selectFirstLabel();
  }
});

document.onkeypress = function(e) {
  if (e.key === 'j') {
    labelListView.selectNextLabel();
  } else if (e.key === 'k') {
    labelListView.selectPreviousLabel();
  } else if (e.key === 'g') {
    labelListView.selectFirstLabel();
  } else if (e.key === 'G') {
    labelListView.selectLastLabel();
  }
};

labelCollection.fetch();
