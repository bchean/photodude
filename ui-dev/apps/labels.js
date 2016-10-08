var Backbone = require('backbone'),
    _ = require('underscore'),
    $ = require('jquery'),
    MC = require('./mc'),
    R = require('./route');

var dispatcher = _.extend({}, Backbone.Events);

var LabelListItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'listItem',

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
  el: '.list',

  // 1-based. We start at a dummy value for convenience.
  selectedIndex_1: null,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
    dispatcher.on('click:label', this.handleClickLabel, this);
  },

  render: function() {
    this.$el.html(null);

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

var CurrentLabelPhotoCollageView = Backbone.View.extend({
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
        var collageItem = new CurrentLabelPhotoCollageItemView({model: photoModel});
        this.$el.append(collageItem.render().$el);
      }, this);
    }
    return this;
  },

  handleUpdateCurrentLabel: function(newLabelModel) {
    var newLabelId = newLabelModel.get('id');
    this.collection.fetch({data: {label_id: newLabelId}});
    labelRouter.navigate(newLabelModel.get('name'));
  }
});

var CurrentLabelPhotoCollageItemView = Backbone.View.extend({
  tagName: 'a',

  render: function() {
    this.$el.attr('href', '/photos/#' + this.model.get('filename'));

    var $photoImageEl = $('<img/>');
    $photoImageEl.addClass('image');
    $photoImageEl.attr('src', '/photo_files/' + this.model.get('filename'));
    this.$el.append($photoImageEl);

    return this;
  }
})

var CreateLabelModalView = Backbone.View.extend({
  el: '#createLabelModal',
  events: {
    'keypress #labelInput': 'handleInputKeypress',
    'click #closeCreateLabelModal': 'hide'
  },

  show: function() {
    this.$el.removeClass('hidden');
    this.$('#labelInput').focus();
    this.$('#labelInput').val(null);
  },

  hide: function() {
    this.$el.addClass('hidden');
    $('#linkToPhotosPage').focus();
  },

  isVisible: function() {
    return !this.$el.hasClass('hidden');
  },

  handleInputKeypress: function(e) {
    if (e.keyCode === 13) { // enter
      var newLabelName = this.$('#labelInput').val().trim();
      if (newLabelName) {
        this.createLabel(newLabelName);
      }
    }
  },

  createLabel: function(newLabelName) {
    labelCollection.create({name: newLabelName});
    this.hide();
  }
});

var labelCollection = new MC.LabelCollection({}, {
  comparator: 'name'
});
var labelRouter = new R.LabelRouter({
  dispatcher: dispatcher,
  labelCollection: labelCollection
});

var labelListView = new LabelListView({collection: labelCollection});
var photoCollection = new MC.PhotoCollection();
var currentLabelPhotosView = new CurrentLabelPhotoCollageView({collection: photoCollection});
var createLabelModalView = new CreateLabelModalView();

$('#createLabelButton').on('click', createLabelModalView.show.bind(createLabelModalView));

$(document).keypress(function(e) {
  if (!createLabelModalView.isVisible()) {
    if (e.key === 'j') {
      labelListView.selectNextLabel();
    } else if (e.key === 'k') {
      labelListView.selectPreviousLabel();
    } else if (e.key === 'g') {
      labelListView.selectFirstLabel();
    } else if (e.key === 'G') {
      labelListView.selectLastLabel();
    }
  }
});

$(document).keyup(function(e) {
  // With keypress, the 'l' makes it into the input box.
  if (e.key === 'l') {
    if (!createLabelModalView.isVisible()) {
      createLabelModalView.show();
    }
  }
});

labelCollection.fetch({
  success: function() {
    Backbone.history.start();
  }
});
$('#linkToPhotosPage').focus();
