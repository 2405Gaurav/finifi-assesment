/**
 * Simple in-memory storage service for milestone 1
 */
class MemoryStore {
  private documents: any[] = [];

  /**
   * Adds a parsed document to the store
   * @param document The parsed document data
   */
  addDocument(document: any) {
    this.documents.push({
      ...document,
      storedAt: new Date(),
    });
  }

  /**
   * Returns all stored documents
   */
  getAllDocuments() {
    return this.documents;
  }

  /**
   * Clears all stored documents
   */
  clearDocuments() {
    this.documents = [];
  }
}

export const memoryStore = new MemoryStore();
