export class Observer {
  constructor() {
    this.subscribers = {};
  }

  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(callback);
  }

  unsubscribe(event, callback) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event] = this.subscribers[event].filter((subscriber) => subscriber !== callback);
  }

  publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event].forEach((subscriber) => subscriber(data));
  }
}
