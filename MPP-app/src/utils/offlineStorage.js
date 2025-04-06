const STORAGE_KEY = 'offlineOps';

export function saveOperation(op) {
  const ops = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  localStorage.setItem(STORAGE_KEY, [...ops, op]);
}

export function getAllOperations() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function clearOperations() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveBook(book) {
    const current = JSON.parse(localStorage.getItem('offlineBooks') || '[]');
    localStorage.setItem('offlineBooks', JSON.stringify([...current, book]));
}

export function deleteBook(id) {
    const current = JSON.parse(localStorage.getItem('offlineBooks') || '[]');
    const updated = current.filter((book) => book.id !== id);
    localStorage.setItem('offlineBooks', JSON.stringify(updated));
}

export function getAllBooks() {
    return JSON.parse(localStorage.getItem('offlineBooks') || '[]');
}

export function clearBooks() {
    localStorage.removeItem('offlineBooks');
}


