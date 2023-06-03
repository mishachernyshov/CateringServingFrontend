import ActionType from "./actionType";


export default class SortingChangeType extends ActionType {
  static PARAMETER_CHANGE = new SortingChangeType('PARAMETER_CHANGE');
  static ORDERING_CHANGE = new SortingChangeType('PARAMETER_CHANGE');
}
