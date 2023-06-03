import ReducerChangeType from "./reducerChangeType";


export default class CateringEstablishmentMainInfoChangeType extends ReducerChangeType{
  static RATING_CHANGE = new CateringEstablishmentMainInfoChangeType('RATING_CHANGE');
  static ENTIRE_DATA_UPDATE = new CateringEstablishmentMainInfoChangeType('ENTIRE_DATA_UPDATE');
}
