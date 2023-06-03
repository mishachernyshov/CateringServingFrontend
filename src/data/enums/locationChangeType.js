import ReducerChangeType from "./reducerChangeType";


export default class LocationChangeType extends ReducerChangeType{
  static COUNTRY_CHANGED = new LocationChangeType('COUNTRY_CHANGED');
  static REGION_CHANGED = new LocationChangeType('REGION_CHANGED');
  static SETTLEMENT_CHANGED = new LocationChangeType('SETTLEMENT_CHANGED');
  static ADDRESS_CHANGED = new LocationChangeType('ADDRESS_CHANGED');
  static ENTIRE_LOCATION_UPDATE = new LocationChangeType('ENTIRE_LOCATION_UPDATE');
}
