import {useCallback, useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Accordion from 'react-bootstrap/Accordion';

import PageLoading from "../Widgets/PageLoading";
import {makeAuthenticatedRequest} from "../../utils/request";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Booking from "./Booking";
import UserBookingsContext, {UserBookingsSetContext} from "./UserBookingsContext";


export default function Bookings () {
  const [establishmentsRepresentation, setEstablishmentsRepresentation] = useState(null);
  const [tablesCharacteristics, setTablesCharacteristics] = useState(null);
  const [workHours, setWorkHours] = useState(null);
  const [dishesNames, setDishesNames] = useState(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const userBookings = useContext(UserBookingsContext);
  const setUserBookings = useContext(UserBookingsSetContext);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const getQueryParamsWithIds = ids => {
    return ids.map(id => `id=${id}&`).join('');
  };

  const getDishesIds = bookingsData => {
    const ids = new Set();

    for (const bookingData of bookingsData) {
      for (const ordered_dish of bookingData.ordered_dishes) {
        ids.add(ordered_dish.catering_establishment_dish.dish);
      }
    }

    return [...ids];
  };

  const buildDishesNameToIdMapping = dishesNames => {
    const mapping = {};

    for (const item of dishesNames) {
      mapping[item.id] = item.name;
    }

    return mapping;
  };

  const getUserBookings = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_USER_BOOKINGS_URL}?`
          + `extended=true&active_only=${activeOnly}&`
        ),
      },
      navigate,
    )
      .then(response => response.data);
  }, [activeOnly, navigate]);

  const getCateringEstablishmentRepresentation = useCallback(establishmentsIds => {
    const establishmentsIdsParams = getQueryParamsWithIds(establishmentsIds);
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENT_REPRESENTATION_URL
          + `?${establishmentsIdsParams}`
        ),
      },
      navigate,
    )
      .then(response => response.data);
  }, [navigate]);

  const getTablesCharacteristics = useCallback(establishmentsIds => {
    const establishmentsIdsParams = getQueryParamsWithIds(establishmentsIds);
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENT_TABLES_URL
          + `?${establishmentsIdsParams}`
        ),
      },
      navigate,
    )
      .then(response => response.data);
  }, [navigate]);

  const getDishesNames = useCallback(dishesIds => {
    const dishesIdsParams = getQueryParamsWithIds(dishesIds);
    return makeAuthenticatedRequest(
      {url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_DISHES_NAMES_URL}?${dishesIdsParams}&`},
      navigate,
    )
      .then(response => response.data);
  }, [navigate]);

  const getWorkHours = useCallback(establishmentsIds => {
    const establishmentsIdsParams = getQueryParamsWithIds(establishmentsIds);
    return makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_WORK_HOURS_URL}`
          + `?${establishmentsIdsParams}&`
        ),
      },
      navigate,
    )
      .then(response => response.data);
  }, [navigate]);

  useEffect(() => {
    (async () => {
      const bookingsData = await getUserBookings();
      const establishmentsIds = bookingsData.map(booking => booking.catering_establishment);
      const dishesIds = getDishesIds(bookingsData);

      const [
        establishmentsRepresentationData,
        tablesCharacteristicsData,
        dishesNamesData,
        workHours,
      ] = await Promise.all([
        getCateringEstablishmentRepresentation(establishmentsIds),
        getTablesCharacteristics(establishmentsIds),
        getDishesNames(dishesIds),
        getWorkHours(establishmentsIds),
      ]);

      setUserBookings(bookingsData);
      setEstablishmentsRepresentation(establishmentsRepresentationData);
      setTablesCharacteristics(tablesCharacteristicsData);
      setDishesNames(buildDishesNameToIdMapping(dishesNamesData));
      setWorkHours(workHours);
    })();
  }, [
    getCateringEstablishmentRepresentation,
    getDishesNames,
    getTablesCharacteristics,
    getUserBookings,
    setUserBookings,
    getWorkHours,
  ]);

  const handleActiveOnlyCheckingChange = event => {
    setActiveOnly(event.currentTarget.checked);
  }

  if ([userBookings, establishmentsRepresentation, tablesCharacteristics].some(item => !item)) {
    return <PageLoading />;
  }

  return (
    <div className='page-content-wrapper'>
      <div id='booking-filters-wrapper'>
        <Form.Check
          type="checkbox"
          label={t('Active only')}
          checked={activeOnly}
          onChange={handleActiveOnlyCheckingChange}
        />
      </div>
      <div id='bookings-list'>
        {
          userBookings.length
            ? <Accordion>
              {
                userBookings.map(booking =>
                  <Booking
                    key={booking.id}
                    bookingData={booking}
                    establishmentsRepresentation={establishmentsRepresentation}
                    tablesCharacteristics={tablesCharacteristics}
                    dishesNames={dishesNames}
                    workHours={workHours}
                  />
                )
              }
            </Accordion>
            : <div className='asd'>
              <div>{t('You have no bookings')}</div>
            </div>
        }
      </div>
    </div>
  )
};
