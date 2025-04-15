class CommentsExtension {
  static $inject = [
    "elementRegistry",
    "eventBus",
    "overlays",
    "config.cache"
  ];

  constructor(elementRegistry, eventBus, overlays, cache) {
    this.elementRegistry = elementRegistry;
    this.overlays = overlays;

    eventBus.on('import.done', () => {
      const comments = cache.getCacheData('comments') || [];

      
      this.updateOverlays(comments);
    });

    cache.subscribe((key, comments) => {
      if (key === 'comments') {
        this.updateOverlays(comments);
      }
    });
  }

  updateOverlays(comments) {
    this.overlays.remove({ type: 'comments' });

    this.elementRegistry.forEach((element) => {
      const commentsElement = comments.filter(comment => comment.elementId === element.id);

      if (commentsElement.length > 0) {
        this.overlays.add(element.id, 'comments', {
          position: {
            bottom: 0,
            left: 0
          },
          html: `<div class="comments">${ commentsElement.length }</div>`
        });
      }
    });
  }
}

export default {
  __init__: [ "commentsExtension" ],
  commentsExtension: [ "type", CommentsExtension ]
}