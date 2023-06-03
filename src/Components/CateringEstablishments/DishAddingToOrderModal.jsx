import React, {memo, useState, useContext} from "react";
import Modal from "react-bootstrap/Modal";
import {useTranslation} from "react-i18next";
import {Dropdown, DropdownButton, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";

import {DISH_WEIGHT_BASE} from "../../data/constants/settings";
import BookingCreateOrEditModal from "../Booking/BookingCreateOrEditModal";
import UserBookingsContext from "../Booking/UserBookingsContext";
import Spinner from "react-bootstrap/Spinner";
import {getObject} from "../../utils/array";
import {makeAuthenticatedRequest} from "../../utils/request";
import {useNavigate} from "react-router-dom";
import TablesContext from "./TablesContext";


export default memo(({show, setShow, establishmentDish}) => {
  const [showBookingCreationModal, setShowBookingCreationModal] = useState(false);
  const userBookings = useContext(UserBookingsContext);
  const [booking, setBooking] = useState(null);
  const [weight, setWeight] = useState(DISH_WEIGHT_BASE);
  const tables = useContext(TablesContext);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleWeightChange = event => setWeight(event.target.value);
  const handleShowBookingCreationModal = _ => {
    setShow(false);
    setShowBookingCreationModal(true);
  };
  const handleCloseBookingCreationModal = _ => {
    setShowBookingCreationModal(false);
    setShow(true);
  };
  const dishOrderPrice = (weight * establishmentDish['final_price'] / DISH_WEIGHT_BASE).toFixed(2);
  const closeHandler = _ => setShow(false);
  const getBookingTitle = booking => {
    const table = getObject(tables, 'id', booking.catering_establishment_table);
    return (
      `${t('date_format', {date: new Date(booking['start_datetime'])})} - `
      + `${t('date_format', {date: new Date(booking['end_datetime'])})} ${t('Table')} №${table.number}`
    );
  };
  const chooseBooking = bookingId => {
    setBooking(getObject(userBookings, 'id', parseInt(bookingId)));
  }

  const resetAndClose = () => {
    setBooking(null);
    setWeight(DISH_WEIGHT_BASE);
    closeHandler();
  }

  const populateOrder = () => {
    return makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_ORDER_POPULATION_URL}`,
        method: 'post',
        data: {
          booking: booking.id,
          catering_establishment_dish: establishmentDish.id,
          weight: weight,
        },
      },
      navigate,
    )
      .then(_ => resetAndClose());
  }

  return (
    <>
      <Modal
        show={show}
        onHide={resetAndClose}
        backdrop="static"
        keyboard={true}
        size='lg'
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('Dish adding to order')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-wrapper'>
            <div>{t('Your booking')}</div>
            {
              userBookings
                ? <DropdownButton
                    title={booking ? getBookingTitle(booking) : t('Choose a booking')}
                    onSelect={chooseBooking}
                  >
                    {
                      userBookings.map(currentBooking =>
                        <Dropdown.Item
                          key={currentBooking.id}
                          eventKey={currentBooking.id}
                          active={booking && currentBooking.id === booking.id}
                        >
                          {getBookingTitle(currentBooking)}
                        </Dropdown.Item>
                      )
                    }
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleShowBookingCreationModal}>
                      {t('Add new booking')}
                    </Dropdown.Item>
                  </DropdownButton>
                : <Spinner variant="primary" />
            }
            <div>{t('Weight, g')}</div>
            <Form.Control type="number" value={weight} onChange={handleWeightChange} />
            <div>{t('Price, ₴')}</div>
            <div>{dishOrderPrice}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={resetAndClose}>
            {t('Close')}
          </Button>
          <Button className='action-btn' onClick={populateOrder} disabled={!(booking && weight)}>
              {t('Confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
      <BookingCreateOrEditModal
        show={showBookingCreationModal}
        closeHandler={handleCloseBookingCreationModal}
      />
    </>
  );
});
