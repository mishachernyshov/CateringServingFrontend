import ReducerChangeType from "./reducerChangeType";


export default class DishCharacteristicsChangeType extends ReducerChangeType{
  static CATEGORY_CHANGED = new DishCharacteristicsChangeType('CATEGORY_CHANGED');
  static SUBCATEGORY_CHANGED = new DishCharacteristicsChangeType('SUBCATEGORY_CHANGED');
  static FOOD_CHANGED = new DishCharacteristicsChangeType('FOOD_CHANGED');
  static ENTIRE_UPDATE = new DishCharacteristicsChangeType('ENTIRE_UPDATE');
}