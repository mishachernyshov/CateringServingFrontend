import PaginationChangeType from "../enums/paginationChangeType";

export default function paginationReducer (state, action) {
  switch (action.type) {
    case PaginationChangeType.PAGE_NUMBER_CHANGED:
      return {number: action.payload, count: state.count, lastChangeType: action.type};
    case PaginationChangeType.DATA_CHANGED:
      return {number: 1, count: action.payload, lastChangeType: action.type};
    case PaginationChangeType.PAGE_DATA_APPLIED:
      return {...state, lastChangeType: action.type};
    default:
      return state;
  }
}
