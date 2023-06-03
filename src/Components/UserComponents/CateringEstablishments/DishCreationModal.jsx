import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {useTranslation} from "react-i18next";
import {useReducer, useState} from "react";
import {Dropdown, DropdownButton} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {makeAuthenticatedRequest} from "../../../utils/request";
import {useNavigate} from "react-router-dom";
import {useQueryClient} from "react-query";
import {DISH_RELATED_DATA} from "../../../data/constants/queryKeys";
import {objectsComparatorFactory} from "../../../utils/factories";
import dishCharacteristicsReducer from "../../../data/reducers/dishCharacteristics";
import DishCharacteristicsChangeType from "../../../data/enums/dishCharacteristicsChangeType";


export default function DishCreationModal (
  {dishNameCreationShowingStatus, closeDishNameCreationModal, dishRelatedData}
) {
  const [dishCharacteristics, dispatchDishCharacteristics] = useReducer(
    dishCharacteristicsReducer,
    {
      category: null,
      subcategory: null,
      food: null,
    },
  );
  const [name, setName] = useState('');

  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const changeName = event => {
    setName(event.target.value);
  }

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

  const getCategory = categoryId => {
    return dishRelatedData['categories'].find(dishesCategory => dishesCategory.id === categoryId);
  }

  const getCurrentSubcategory = () => {
    return getCategory(dishCharacteristics['category'])['subcategories'].find(
      dishesSubcategory => dishesSubcategory.id === dishCharacteristics['subcategory']
    );
  }

  const getCurrentFood = () => {
    return dishRelatedData['foods'].find(food => food.id === dishCharacteristics['food']);
  }

  const getDishCreationData = () => {
    return {
      name: name,
      food: dishCharacteristics['food'],
      subcategory: dishCharacteristics['subcategory'],
    };
  }

  const createDish = () => {
    return makeAuthenticatedRequest(
      {
        url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_DISH_URL,
        method: 'post',
        data: getDishCreationData(),
      },
      navigate,
    )
      .then(response => {
        const updatedDishesNames = [
          ...dishRelatedData['dishes_names'],
          {id: response.data.id, name: response.data.name}
        ].sort(objectsComparatorFactory('name'));
        queryClient.setQueriesData(
          DISH_RELATED_DATA,
          oldData => {
            return {...oldData, 'dishes_names': updatedDishesNames};
          },
        );

        closeDishNameCreationModal();
        dispatchDishCharacteristics({
          type: DishCharacteristicsChangeType.ENTIRE_UPDATE,
          payload: {
            category: null,
            subcategory: null,
            food: null,
          },
        });
        setName('');
      });
  }

  return (
    <Modal
      show={dishNameCreationShowingStatus}
      onHide={closeDishNameCreationModal}
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('Dish adding')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='form-wrapper'>
          <div>{t('Name')}</div>
          <Form.Control
            maxLength='64'
            value={name}
            onChange={changeName}
          />
          <div>{t('Category')}</div>
          <DropdownButton
            variant='primary'
            title={
              dishCharacteristics['category']
                ? getCategory(dishCharacteristics['category']).name
                : t('Choose a category')
            }
            onSelect={changeCategory}
          >
            {
              dishRelatedData['categories'].map(currentCategory =>
                <Dropdown.Item
                  eventKey={currentCategory.id}
                  key={currentCategory.id}
                >
                  {currentCategory.name}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
          <div>{t('Subcategory')}</div>
          <DropdownButton
            variant='primary'
            title={dishCharacteristics['subcategory'] ? getCurrentSubcategory().name : t('Choose a subcategory')}
            onSelect={changeSubcategory}
            disabled={!dishCharacteristics['category']}
          >
            {
              dishCharacteristics['category']
                && getCategory(dishCharacteristics['category']).subcategories.map(currentSubcategory =>
                  <Dropdown.Item
                    eventKey={currentSubcategory.id}
                    key={currentSubcategory.id}
                  >
                    {currentSubcategory.name}
                  </Dropdown.Item>
                )
            }
          </DropdownButton>
          <div>{t('Food')}</div>
          <DropdownButton
            variant='primary'
            title={dishCharacteristics['food'] ? getCurrentFood().name : t('Choose a food')}
            onSelect={changeFood}
          >
            {
              dishRelatedData['foods'].map(currentFood =>
                <Dropdown.Item
                  eventKey={currentFood.id}
                  key={currentFood.id}
                >
                  {currentFood.name}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeDishNameCreationModal}>
          {t('Close')}
        </Button>
        <Button variant="primary" onClick={createDish}>{t('Add')}</Button>
      </Modal.Footer>
    </Modal>
  )
}
