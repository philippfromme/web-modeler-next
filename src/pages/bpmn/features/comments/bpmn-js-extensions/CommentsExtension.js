class CommentsExtension {
  static $inject = [
    "elementRegistry",
    "eventBus",
    "overlays",
    "selection",
    "config.cache"
  ];

  constructor(elementRegistry, eventBus, overlays, selection, cache) {
    this.elementRegistry = elementRegistry;
    this.overlays = overlays;
    this.selection = selection;

    eventBus.on("import.done", () => {
      const comments = cache.getCacheData("comments") || [];

      this.updateOverlays(comments);
    });

    cache.subscribe((key, comments) => {
      if (key === "comments") {
        this.updateOverlays(comments);
      }
    });
  }

  updateOverlays(comments) {
    this.overlays.remove({ type: "comments" });

    this.elementRegistry.forEach((element) => {
      const commentsElement = comments.filter(comment => comment.elementId === element.id);

      if (commentsElement.length > 0) {
        const html = document.createElement("div");

        html.className = "comments";
        html.textContent = commentsElement.length;

        html.addEventListener("click", () => {
          this.selection.select(element);
        });

        this.overlays.add(element.id, "comments", {
          position: {
            bottom: 0,
            left: 0
          },
          html
        });
      }
    });
  }
}

export default {
  __init__: [ "commentsExtension" ],
  commentsExtension: [ "type", CommentsExtension ]
}