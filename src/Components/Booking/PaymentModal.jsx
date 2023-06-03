import React, {memo, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {makeAuthenticatedRequest} from "../../utils/request";
import {useNavigate} from "react-router-dom";


export default memo(function PaymentModal ({show, closeHandler, booking, setBooking, title, totalAmountToPay}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expirationMonth, setExpirationMonth] = useState('');
  const [expirationYear, setExpirationYear] = useState('');
  const [cvv2, setCvv2] = useState('');

  const {t} = useTranslation();
  const navigate = useNavigate();

  const resetAndClose = () => {
    setCardNumber('');
    setExpirationMonth('');
    setExpirationYear('');
    setCvv2('');
    closeHandler();
  };

  const changeCardNumber = event => {
    setCardNumber(event.target.value);
  };

  const changeExpirationMonth = event => {
    setExpirationMonth(event.target.value);
  };

  const changeExpirationYear = event => {
    setExpirationYear(event.target.value);
  };

  const changeCvv2 = event => {
    setCvv2(event.target.value);
  };

  const payBooking = () => {
    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BOOKING_PAYMENT_URL}`,
        method: 'post',
        data: {booking: booking.id, amount: totalAmountToPay},
      },
      navigate,
    )
      .then(_ => {
        const updatedBooking = {...booking};
        updatedBooking.is_paid = true;
        setBooking(updatedBooking);

        resetAndClose();
      });
  };

  return (
    <Modal
      show={show}
      onHide={resetAndClose}
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <div>{t('Booking payment')}</div>
          <div>{title}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='booking-payment-wrapper'>
          <div>
            <div className='card-info-item card-number'>
              <div>{t('Card number')}</div>
              <Form.Control maxlength='16' value={cardNumber} onChange={changeCardNumber} />
            </div>
          </div>
          <div>
            <div className='card-info-item card-expiration'>
              <div>{t('Expires')}</div>
              <div>
                <Form.Control maxlength='2' value={expirationMonth} onChange={changeExpirationMonth} />
                <div>/</div>
                <Form.Control maxlength='2' value={expirationYear} onChange={changeExpirationYear} />
              </div>
            </div>
            <div className='card-info-item cvv2'>
              <div>CVV2</div>
              <Form.Control type='password' maxlength='3' value={cvv2} onChange={changeCvv2} />
            </div>
          </div>
          <div className='price'>{t('Price, ₴')}: {totalAmountToPay}</div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={resetAndClose}>
          {t('Close')}
        </Button>
        <Button
          className='action-btn'
          disabled={cardNumber.length < 16 || !expirationMonth.length || !expirationYear.length || cvv2.length < 3}
          onClick={payBooking}
        >
          {t('Pay')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
