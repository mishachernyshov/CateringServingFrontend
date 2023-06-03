import ReducerChangeType from "./reducerChangeType";


export default class RangeChangeType extends ReducerChangeType {
  static MIN_VALUE_CHANGED = new RangeChangeType('MIN_VALUE_CHANGED');
  static MAX_VALUE_CHANGED = new RangeChangeType('MAX_VALUE_CHANGED');
}
