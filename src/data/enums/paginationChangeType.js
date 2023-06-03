import ReducerChangeType from "./reducerChangeType";


export default class PaginationChangeType extends ReducerChangeType {
  static PAGE_NUMBER_CHANGED = new PaginationChangeType('PAGE_NUMBER_CHANGED');
  static DATA_CHANGED = new PaginationChangeType('DATA_CHANGED');
  static PAGE_DATA_APPLIED = new PaginationChangeType('PAGE_DATA_APPLIED');
}
