const getItemFromLocalStorage = (key: string): string | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      const parsed = JSON.parse(item);
      return typeof parsed === "string" ? parsed : item;
    } catch {
      return item;
    }
  } catch (error) {
    throw new Error(
      `Error retrieving ${key} from localStorage: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
};

const setItemInLocalStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(
      `Error setting ${key} in localStorage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    throw new Error(
      `Error clearing localStorage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const removeItemFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    throw new Error(
      `Error removing ${key} from localStorage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export {
  getItemFromLocalStorage,
  setItemInLocalStorage,
  clearLocalStorage,
  removeItemFromLocalStorage,
};
