import ReducerChangeType from "./reducerChangeType";


export default class TimelineChangeType extends ReducerChangeType {
  static TIME_RANGE_CHANGED = new TimelineChangeType('TIME_RANGE_CHANGED');
  static DISABLED_INTERVALS_CHANGED = new TimelineChangeType('DISABLED_INTERVALS_CHANGED');
}
