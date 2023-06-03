import LocationChangeType from "../enums/locationChangeType";

export default function locationReducer (state, action) {
  switch (action.type) {
    case LocationChangeType.COUNTRY_CHANGED:
      return {
        country: action.payload,
        region: null,
        settlement: null,
        address: '',
      };
    case LocationChangeType.REGION_CHANGED:
      return {
        ...state,
        region: action.payload,
        settlement: null,
        address: '',
      };
    case LocationChangeType.SETTLEMENT_CHANGED:
      return {
        ...state,
        settlement: action.payload,
        address: '',
      };
    case LocationChangeType.ADDRESS_CHANGED:
      return {
        ...state,
        address: action.payload,
      };
    case LocationChangeType.ENTIRE_LOCATION_UPDATE:
      return {...action.payload};
    default:
      return state;
  }
}
