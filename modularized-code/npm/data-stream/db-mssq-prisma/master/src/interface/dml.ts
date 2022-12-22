export interface DML<T> {
  sync(req: T): any;
}