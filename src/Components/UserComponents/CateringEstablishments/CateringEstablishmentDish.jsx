import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import uploadIcon from "../../../images/upload-icon.png";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";
import {useState} from "react";
import {v4 as uuidv4} from 'uuid';

import DishCreationModal from "./DishCreationModal";
import {DISCOUNT_TYPES, PERCENT_DISCOUNT} from "../../../data/constants/discountTypes";


export default function CateringEstablishmentDish ({dish, dishes, setDishes, dishRelatedData}) {
  const [newEntity, setNewEntity] = useState({
    discount: {
      enabled: false,
      type: 'percent',
      amount: 0,
      start_datetime: '1900-01-01T00:00',
      end_datetime: '1900-01-01T00:00',
    },
    dish: undefined,
    photo: undefined,
    description: '',
    price: 0,
  });
  const [dishNameCreationShowingStatus, setDishNameCreationShowingStatus] = useState(false);

  const getHandledDishState = _ => {
    const handledDish = dish ? dish : newEntity;
    const handledDishUpdater = (key, value) => {
      if (dish) {
        const updatedDishes = [...dishes];
        updatedDishes.find(item => item === dish)[key] = value;
        setDishes(updatedDishes);
      } else {
        setNewEntity({...newEntity, [key]: value});
      }
    }

    return [handledDish, handledDishUpdater];
  }

  const [handledDish, setHandledDish] = getHandledDishState();
  const {t} = useTranslation();

  const uploadPhoto = event => {
    if (event.target.files.length) {
      setHandledDish('photo', URL.createObjectURL(event.target.files[0]));
    }
    event.target.value = "";
  }

  const changeDish = (dishId) => {
    if (dishId) {
      setHandledDish('dish', parseInt(dishId));
    }
  }

  const setDescription = event => {
    setHandledDish('description', event.target.value);
  }

  const setPrice = event => {
    setHandledDish('price', event.target.value);
  }

  const deleteDish = _ => {
    const updatedDishes = [...dishes];
    const dishIndex = dishes.indexOf(dish);
    updatedDishes.splice(dishIndex, 1);
    setDishes(updatedDishes);
  }

  const addDish = _ => {
    setDishes([...dishes, newEntity]);
    setNewEntity({discount: {enabled: false, type: '', amount: 0}, description: '', price: 0});
  }

  const setDiscountStatus = event => {
    const updatedHandledDishDiscount = {...handledDish.discount, enabled: event.target.checked};
    if (!updatedHandledDishDiscount['type']) {
      updatedHandledDishDiscount['type'] = PERCENT_DISCOUNT.name;
    }
    if (!updatedHandledDishDiscount['amount']) {
      updatedHandledDishDiscount['amount'] = 0;
    }

    setHandledDish('discount', updatedHandledDishDiscount);
  }

  const changeDiscountFieldValue = (field, newValue) => {
    setHandledDish('discount', {...handledDish.discount, [field]: newValue});
  }

  const closeDishNameCreationModal = () => {
    setDishNameCreationShowingStatus(false);
  }

  const openDishNameCreationModal = () => {
    setDishNameCreationShowingStatus(true);
  }

  return (
    <>
      <Card className='dish-card'>
        <Card.Body>
          <Form.Group controlId={`upload_dish_photo_${handledDish.id ? handledDish.id : uuidv4()}`}>
            <Form.Label style={{margin: 0, width: '100%'}}>
              <div className='dish-img-wrapper'>
                <Card.Img
                  src={handledDish.photo ? handledDish.photo : uploadIcon}
                  onMouseOver={event => {
                    event.target.src = uploadIcon;
                  }}
                  onMouseOut={event => {
                    event.target.src = handledDish.photo ? handledDish.photo : uploadIcon;
                  }}
                />
              </div>
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              style={{display: 'none'}}
              onChange={event => uploadPhoto(event)}
            />
          </Form.Group>
          <div className='dish-characteristics-wrapper'>
            <div>{t('Name')}</div>
            <DropdownButton
              variant='secondary'
              title={handledDish.dish ? dishRelatedData['dishes_names'].find(item => item.id === handledDish.dish).name : t('Choose dish')}
              onSelect={changeDish}
            >
              {
                dishRelatedData['dishes_names'].map((existedDish, existedDishIndex) =>
                  <Dropdown.Item
                    eventKey={existedDish.id}
                    key={existedDishIndex}
                  >
                    {existedDish.name}
                  </Dropdown.Item>
                )
              }
              <Dropdown.Divider />
              <Dropdown.Item onClick={openDishNameCreationModal}>{t('Add new dish')}</Dropdown.Item>
            </DropdownButton>
            <div>{t('Description')}</div>
            <Form.Control
              as="textarea"
              rows="6"
              value={handledDish.description}
              onChange={setDescription}
            />
            <div>{t('Price for 100g, ₴')}</div>
            <Form.Control
              type='number'
              value={handledDish.price}
              min='0'
              onChange={setPrice}
            />
            <Form.Check
              type='checkbox'
              label={t('Discount')}
              checked={handledDish.discount['enabled']}
              onChange={setDiscountStatus}
            />
            <div></div>
            {
              handledDish.discount['enabled'] &&
              <>
                <div>{t('Type')}</div>
                <DropdownButton
                  variant='primary'
                  title={t(
                    DISCOUNT_TYPES.find(discountType => discountType.name === handledDish.discount['type']).verboseName
                  )}
                >
                  {
                    DISCOUNT_TYPES.map((discountType, discountTypeIndex) =>
                      <Dropdown.Item
                        key={discountTypeIndex}
                        onClick={_ => changeDiscountFieldValue('type', discountType.name)}
                      >
                        {t(discountType.verboseName)}
                      </Dropdown.Item>
                    )
                  }
                </DropdownButton>
                <div>{t('Value')}</div>
                <Form.Control
                  type='number'
                  min='0'
                  value={handledDish.discount['amount']}
                  onChange={event => changeDiscountFieldValue('amount', event.target.value)}
                />
                <div>{t('From')}</div>
                <Form.Control
                  type='datetime-local'
                  value={handledDish.discount['start_datetime']}
                  onChange={event => changeDiscountFieldValue('start_datetime', event.target.value)}
                />
                <div>{t('To')}</div>
                <Form.Control
                  type='datetime-local'
                  value={handledDish.discount['end_datetime']}
                  onChange={event => changeDiscountFieldValue('end_datetime', event.target.value)}
                />
              </>
            }
          </div>
          <div className='card-action'>
            {
              dish
                ? <Button
                  onClick={deleteDish}
                  variant="danger"
                >{t('Delete')}</Button>
                : <Button
                  onClick={addDish}
                  variant="primary"
                >{t('Add')}</Button>
            }
          </div>
        </Card.Body>
      </Card>
      <DishCreationModal
        dishNameCreationShowingStatus={dishNameCreationShowingStatus}
        closeDishNameCreationModal={closeDishNameCreationModal}
        dishRelatedData={dishRelatedData}
      />
    </>
  );
}
