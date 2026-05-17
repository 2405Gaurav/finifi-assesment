/**
 * Simple in-memory store for milestone 1
 */
class MemoryStore {
  private store: Map<string, any> = new Map();

  set(key: string, value: any) {
    this.store.set(key, value);
  }

  get(key: string) {
    return this.store.get(key);
  }

  getAll() {
    return Object.fromEntries(this.store);
  }

  clear() {
    this.store.clear();
  }
}

export const memoryStore = new MemoryStore();
