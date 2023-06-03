import ActionType from "./actionType";


export default class SortingOrderingType extends ActionType {
  static ASCENDING = new SortingOrderingType('ASCENDING', 'Ascending');
  static DESCENDING = new SortingOrderingType('DESCENDING', 'Descending');

  constructor(typeName, verboseTypeName) {
    super(typeName);
    this.verboseTypeName = verboseTypeName;
  }
}
