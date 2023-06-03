import TimelineChangeType from "../enums/timelineChangeType";
import {isTimeRangeAllowed} from "../../utils/timeline";


export default function timelineReducer (state, action) {
  let error;
  switch (action.type) {
    case TimelineChangeType.DISABLED_INTERVALS_CHANGED:
      error = isTimeRangeAllowed(state.timeRange, action.payload);
      return {timeRange: state.timeRange, error: error, disabledIntervals: action.payload};
    case TimelineChangeType.TIME_RANGE_CHANGED:
      error = isTimeRangeAllowed(action.payload, state.disabledIntervals);
      return {timeRange: action.payload, error: error, disabledIntervals: state.disabledIntervals};
    default:
      return state;
  }
}
