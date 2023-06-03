import React, {useState} from "react";
import Card from "react-bootstrap/Card";
import {getObject} from "../../utils/array";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";
import {Offcanvas} from "react-bootstrap";
import DiscountLabel from '../Labels/Discount';

import DishAddingToOrderModal from "./DishAddingToOrderModal";


export default React.memo(function ({establishmentDish, dishRelatedData}) {
  const [showDescription, setShowDescription] = useState(false);
  const [showAddToOrderModal, setShowAddToOrderModal] = useState(false);

  const {t} = useTranslation();

  const handleShowDescription = _ => setShowDescription(true);
  const handleCloseDescription = _ => setShowDescription(false);
  const handleShowAddToOrder = _ => setShowAddToOrderModal(true);

  const getDishInfoMarkup = establishmentDish => {
    const dishCategory = getObject(
      dishRelatedData['categories'],
      'id',
      establishmentDish['dish']['category'],
    );
    const dishSubcategory = getObject(
      dishCategory['subcategories'],
      'id',
      establishmentDish['dish']['subcategory'],
    );
    const food = getObject(dishRelatedData['foods'], 'id', establishmentDish['dish']['food']);

    return (
      <>
        <div className='menu-dish-info-wrapper'>
          <div>{t('Category')}:</div>
          <div>{dishCategory['name']}</div>
          <div>{t('Subcategory')}:</div>
          <div>{dishSubcategory['name']}</div>
          <div>{t('Food')}:</div>
          <div>{food['name']}</div>
          <div>{t('Description')}:</div>
          <Button onClick={handleShowDescription}>{t('Show description')}</Button>
          <div>{t('Price for 100g, ₴')}</div>
          <div className='dish-price-wrapper'>
            <div>{establishmentDish['final_price']}</div>
            {
              establishmentDish['price'] === establishmentDish['final_price']
                ? <></>
                : <>
                  <div className='initial-price'>{establishmentDish['price']}</div>
                  <DiscountLabel discountData={establishmentDish['discount']} />
                </>
            }
          </div>
        </div>
        <Button className='action-btn' onClick={handleShowAddToOrder}>
          {t('Add to the order')}
        </Button>
      </>
    )
  }

  return (
    <div className='card-wrapper'>
      <Card>
        <Card.Img variant="top" src={establishmentDish['photo']} />
        <Card.Header>
          {getObject(dishRelatedData['dishes_names'], 'id', establishmentDish['dish']['id'])['name']}
        </Card.Header>
        <Card.Body>
          {getDishInfoMarkup(establishmentDish)}
        </Card.Body>
      </Card>
      <Offcanvas show={showDescription} onHide={handleCloseDescription}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t('Description')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{establishmentDish['description']}</Offcanvas.Body>
      </Offcanvas>
      <DishAddingToOrderModal
        show={showAddToOrderModal}
        setShow={setShowAddToOrderModal}
        establishmentDish={establishmentDish}
      />
    </div>
  )
});
