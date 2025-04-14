class CommentsExtension {
  static $inject = [
    "eventBus"
  ];

  constructor(eventBus) {
    this.eventBus = eventBus;
  }
}

export default {
  __init__: [ "commentsExtension" ],
  commentsExtension: [ "type", CommentsExtension ]
}