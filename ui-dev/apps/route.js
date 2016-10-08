var Backbone = require('backbone');

exports.PhotoRouter = Backbone.Router.extend({
  routes: {
    '(:photoFilename)': 'getPhoto'
  },

  initialize: function(options) {
    this.dispatcher = options.dispatcher;
    this.photoCollection = options.photoCollection;
  },

  getPhoto: function(photoFilename) {
    var photoModel = this.photoCollection.findWhere({filename: photoFilename});
    if (photoModel) {
      this.dispatcher.trigger('update:currentPhoto', photoModel);
    } else if (this.photoCollection.length) {
      this.dispatcher.trigger('update:currentPhoto', this.photoCollection.at(0));
    }
  }
});

exports.LabelRouter = Backbone.Router.extend({
  routes: {
    '(:labelName)': 'getLabel'
  },

  initialize: function(options) {
    this.dispatcher = options.dispatcher;
    this.labelCollection = options.labelCollection;
  },

  getLabel: function(labelName) {
    var labelModel = this.labelCollection.findWhere({name: labelName});
    if (labelModel) {
      this.dispatcher.trigger('update:currentLabel', labelModel);
    } else if (this.labelCollection.length) {
      this.dispatcher.trigger('update:currentLabel', this.labelCollection.at(0));
    }
  }
});
