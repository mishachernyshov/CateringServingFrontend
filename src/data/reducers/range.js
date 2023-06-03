import RangeChangeType from "../enums/rangeChangeType";


export default function rangeReducer (state, action) {
  switch (action.type) {
    case RangeChangeType.MIN_VALUE_CHANGED:
      return {...state, min: action.payload};
    case RangeChangeType.MAX_VALUE_CHANGED:
      return {...state, max: action.payload};
    default:
      return state;
  }
}
