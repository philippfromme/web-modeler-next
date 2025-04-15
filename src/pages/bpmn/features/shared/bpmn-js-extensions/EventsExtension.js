class EventsExtension {
  static $inject = [
    "eventBus",
    "selection",
    "config.cache"
  ];

  constructor(eventBus, selection, cache) {
    eventBus.on("import.done", () => {
      cache.setCacheData("selectedElements", selection.get().map(element => element.id));
    });

    eventBus.on("selection.changed", ({ newSelection }) => {
      cache.setCacheData("selectedElements", newSelection.map(element => element.id));
    });
  }
}

export default {
  __init__: [ "eventsExtension" ],
  eventsExtension: [ "type", EventsExtension ]
}