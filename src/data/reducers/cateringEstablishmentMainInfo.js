import CateringEstablishmentMainInfoChangeType from "../enums/cateringEstablishmentMainInfoChangeType";

export default function cateringEstablishmentMainInfoReducer (state, action) {
  switch (action.type) {
    case CateringEstablishmentMainInfoChangeType.RATING_CHANGE:
      return {...state, rating: action.payload};
    case CateringEstablishmentMainInfoChangeType.ENTIRE_DATA_UPDATE:
      return {...action.payload};
    default:
      return state;
  }
}
