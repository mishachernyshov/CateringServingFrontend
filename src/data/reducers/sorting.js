import SortingChangeType from "../enums/sortingChangeType";


export default function sortingReducer (state, action) {
  switch (action.type) {
    case SortingChangeType.PARAMETER_CHANGE:
      return {...state, parameter: action.payload};
    case SortingChangeType.ORDERING_CHANGE:
      return {...state, ordering: action.payload};
    default:
      return state;
  }
}
