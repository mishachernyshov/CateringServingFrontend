import {memo, useCallback, useContext, useMemo, useState} from "react";
import Accordion from "react-bootstrap/Accordion";
import Table from 'react-bootstrap/Table';
import {AiOutlineEdit} from "react-icons/ai";
import {TiInputChecked} from "react-icons/ti";
import {useTranslation} from "react-i18next";
import isEqual from 'deep-equal';

import {getObject} from "../../utils/array";
import BookingDish from "./BookingDish";
import Button from "react-bootstrap/Button";
import PaymentModal from "./PaymentModal";
import {DISH_WEIGHT_BASE} from "../../data/constants/settings";
import {WorkHoursSetContext} from "../CateringEstablishments/WorkHoursContext";
import {TablesSetContext} from "../CateringEstablishments/TablesContext";
import BookingCreateOrEditModal from "./BookingCreateOrEditModal";
import {makeAuthenticatedRequest} from "../../utils/request";
import {useNavigate} from "react-router-dom";
import UserBookingsContext, {UserBookingsSetContext} from "./UserBookingsContext";
import deepcopy from "deepcopy";


export default memo(function Booking (
  {bookingData, establishmentsRepresentation, tablesCharacteristics, dishesNames, workHours}
) {
  const [booking, setBooking] = useState(bookingData);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const setWorkHours = useContext(WorkHoursSetContext);
  const setTables = useContext(TablesSetContext);
  const userBookings = useContext(UserBookingsContext);
  const setUserBookings = useContext(UserBookingsSetContext);

  const getEstablishment = useCallback(() => {
    return getObject(establishmentsRepresentation, 'id', booking.catering_establishment);
  }, [booking.catering_establishment, establishmentsRepresentation]);

  const getTable = useCallback(() => {
    return getObject(
      tablesCharacteristics[booking.catering_establishment],
      'id',
      booking.catering_establishment_table,
    );
  }, [booking.catering_establishment, booking.catering_establishment_table, tablesCharacteristics]);

  const establishment = useMemo(() => getEstablishment(), [getEstablishment]);
  const table = useMemo(() => getTable(), [getTable]);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const totalAmountToPay = booking.ordered_dishes.reduce(
    (partialSum, orderedDish) => (
      partialSum + orderedDish.weight * orderedDish.catering_establishment_dish.final_price / DISH_WEIGHT_BASE
    ),
    0,
  )
    .toFixed(2);

  const title = (
    `${establishment.name}: ${t('date_format', {date: new Date(booking['start_datetime'])})} - `
    + `${t('date_format', {date: new Date(booking['end_datetime'])})} ${t('Table')} №${table.number}`
  );

  const isOrderEditable = booking.is_active && !booking.is_paid;

  const resetBooking = () => {
    setBooking(bookingData);
  };

  const handlePaymentModalShowing = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentModalClosing = () => {
    setShowPaymentModal(false);
  };

  const handleBookingEditing = event => {
    event.stopPropagation();

    setWorkHours(workHours[booking.catering_establishment]);
    setTables(tablesCharacteristics[booking.catering_establishment]);
    setShowBookingModal(true);
  }

  const handleCloseBookingEditingModal = () => {
    setShowBookingModal(false);
  };

  const getOrderUpdatingData = () => {
    return {
      booking: booking.id,
      ordered_dishes: booking.ordered_dishes.map(orderedDish => {
        return {
          catering_establishment_dish: orderedDish.catering_establishment_dish.id,
          weight: orderedDish.weight,
        };
      }),
    };
  }

  const applyOrderChanges = () => {
    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_UPDATE_ORDER_URL}`,
        method: 'post',
        data: getOrderUpdatingData(),
      },
      navigate,
    )
      .then(_ => {
        const updatedUserBookings = deepcopy(userBookings);
        for (let i = 0; i < updatedUserBookings.length; ++i) {
          if (updatedUserBookings[i].id === booking.id) {
            updatedUserBookings[i] = deepcopy(booking);
            break;
          }
        }
        setUserBookings(updatedUserBookings);
      })
  }

  return (
    <>
      <Accordion.Item eventKey={booking.id}>
        <Accordion.Header>
          <div>{title}</div>
          {
            booking.is_active
              ? <div className='edit-icon-wrapper'>
                  <AiOutlineEdit onClick={handleBookingEditing} />
                </div>
              : <></>
          }
        </Accordion.Header>
        <Accordion.Body>
          <img src={establishment.photo} />
          <div className='booking-info'>
            {
              booking.ordered_dishes.length
              ? <>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>{t('Dish')}</th>
                        <th>{`${t('Price, ₴')} (${DISH_WEIGHT_BASE} ${t('g')})`}</th>
                        <th>{t('Weight, g')}</th>
                        <th>{t('To pay, ₴')}</th>
                        {isOrderEditable ? <th></th> : <></>}
                      </tr>
                    </thead>
                    <tbody>
                      {
                        booking.ordered_dishes.map(orderedDish =>
                          <BookingDish
                            key={orderedDish.id}
                            orderedDish={orderedDish}
                            dishesNames={dishesNames}
                            booking={booking}
                            setBooking={setBooking}
                            isOrderEditable={isOrderEditable}
                          />
                        )
                      }
                    </tbody>
                  </Table>
                  <div className='total-sum'>{t('Total amount to pay, ₴')}: {totalAmountToPay}</div>
                </>
                : <div>{t('The order is empty.')}</div>
            }
            <div>
              {
                booking.is_paid
                  ? <div className='paid-status'><TiInputChecked /><span>{t('Successfully paid')}</span></div>
                  : <></>
              }
            </div>
            <div className='action-btn-wrapper'>
              {
                isOrderEditable
                  ? isEqual(bookingData, booking)
                    ? booking.ordered_dishes.length
                      ? <Button onClick={handlePaymentModalShowing}>{t('Pay')}</Button>
                      : <></>
                    : <>
                      <Button variant='danger' onClick={resetBooking}>{t('Cancel')}</Button>
                      <Button onClick={applyOrderChanges}>{t('Apply')}</Button>
                    </>
                  : <></>
              }
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>
      <PaymentModal
        show={showPaymentModal}
        closeHandler={handlePaymentModalClosing}
        booking={booking}
        setBooking={setBooking}
        title={title}
        totalAmountToPay={totalAmountToPay}
      />
      <BookingCreateOrEditModal
        show={showBookingModal}
        closeHandler={handleCloseBookingEditingModal}
        bookingId={booking.id}
      />
    </>
  );
});
