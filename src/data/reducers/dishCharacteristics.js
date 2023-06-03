import DishCharacteristicsChangeType from "../enums/dishCharacteristicsChangeType";


export default function dishCharacteristicsReducer (state, action) {
  switch (action.type) {
    case DishCharacteristicsChangeType.CATEGORY_CHANGED:
      return {...state, category: action.payload, subcategory: null};
    case DishCharacteristicsChangeType.SUBCATEGORY_CHANGED:
      return {...state, subcategory: action.payload};
    case DishCharacteristicsChangeType.FOOD_CHANGED:
      return {...state, food: action.payload};
    case DishCharacteristicsChangeType.ENTIRE_UPDATE:
      return {...action.payload};
    default:
      return state;
  }
}
