export interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export class LocalStorageProvider implements StorageProvider {
  private get storage(): Storage | undefined {
    if (typeof localStorage === "undefined") return undefined;
    return localStorage;
  }

  get(key: string): string | null {
    return this.storage?.getItem(key) ?? null;
  }

  set(key: string, value: string): void {
    this.storage?.setItem(key, value);
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
  }
}
