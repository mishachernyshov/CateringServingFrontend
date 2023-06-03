export default class ComponentMode {
  static Creation = new ComponentMode('Creation');
  static Editing = new ComponentMode('Editing');

  constructor(name) {
    this.name = name;
  }
}
