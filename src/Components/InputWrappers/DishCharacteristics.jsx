import {memo} from "react";
import {useTranslation} from "react-i18next";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {getObject} from "../../utils/array";
import DishCharacteristicsChangeType from "../../data/enums/dishCharacteristicsChangeType";


export default memo(function (
  {dishCharacteristics, dispatchDishCharacteristics, dishRelatedData, className}
) {
  const {t} = useTranslation();

  const changeCategory = categoryId => {
    dispatchDishCharacteristics({type: DishCharacteristicsChangeType.CATEGORY_CHANGED, payload: parseInt(categoryId)});
  }

  const changeSubcategory = subcategoryId => {
    dispatchDishCharacteristics({
      type: DishCharacteristicsChangeType.SUBCATEGORY_CHANGED,
      payload: parseInt(subcategoryId),
    });
  }

  const changeFood = foodId => {
    dispatchDishCharacteristics({type: DishCharacteristicsChangeType.FOOD_CHANGED, payload: parseInt(foodId)});
  }

  const selectedCategoryData = (
    dishCharacteristics['category']
    && getObject(dishRelatedData['categories'], 'id', dishCharacteristics['category'])
  );
  const selectedSubcategoryData = (
    dishCharacteristics['subcategory']
    && getObject(selectedCategoryData['subcategories'], 'id', dishCharacteristics['subcategory'])
  );
  const selectedFoodData = (
    dishCharacteristics['food']
    && getObject(dishRelatedData['foods'], 'id', dishCharacteristics['food'])
  );

  return (
    <div className={`inputs-sequence-wrapper ${className}`}>
      <div className='inputs-sequence-item-wrapper'>
        <div>{t('Category')}</div>
        <DropdownButton
          title={dishCharacteristics['category'] ? selectedCategoryData.name : t('Choose a category')}
          onSelect={changeCategory}
        >
          {
            dishRelatedData['categories'].map(currentCategory =>
              <Dropdown.Item
                eventKey={currentCategory.id}
                key={currentCategory.id}
                active={dishCharacteristics['category'] && dishCharacteristics['category'] === currentCategory.id}
              >
                {currentCategory.name}
              </Dropdown.Item>
            )
          }
        </DropdownButton>
      </div>
      {
        dishCharacteristics['category']
        && <div className='inputs-sequence-item-wrapper'>
          <div>{t('Subcategory')}</div>
          <DropdownButton
            title={dishCharacteristics['subcategory'] ? selectedSubcategoryData.name : t('Choose a subcategory')}
            onSelect={changeSubcategory}
          >
            {
              selectedCategoryData['subcategories'].map(currentSubcategory =>
                <Dropdown.Item
                  eventKey={currentSubcategory.id}
                  key={currentSubcategory.id}
                  active={
                    dishCharacteristics['subcategory']
                    && dishCharacteristics['subcategory'] === currentSubcategory.id
                  }
                >
                  {currentSubcategory.name}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
        </div>
      }
      <div className='inputs-sequence-item-wrapper'>
        <div>{t('Food')}</div>
        <DropdownButton
          title={dishCharacteristics['food'] ? selectedFoodData.name : t('Choose a food')}
          onSelect={changeFood}
        >
          {
            dishRelatedData['foods'].map(currentFood =>
              <Dropdown.Item
                eventKey={currentFood.id}
                key={currentFood.id}
                active={dishCharacteristics['food'] && dishCharacteristics['food'] === currentFood.id}
              >
                {currentFood.name}
              </Dropdown.Item>
            )
          }
        </DropdownButton>
      </div>
    </div>
  )
});
