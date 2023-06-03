import React, {useCallback, useEffect, useReducer, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import ReactStars from "react-rating-stars-component";

import cateringEstablishmentMainInfoReducer from "../../data/reducers/cateringEstablishmentMainInfo";
import {makeAuthenticatedRequest} from "../../utils/request";
import CateringEstablishmentMainInfoChangeType from "../../data/enums/cateringEstablishmentMainInfoChangeType";
import {Carousel} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import Menu from "./Menu";
import Feedbacks from "./Feedbacks";
import {TablesProvider} from "./TablesContext";
import {WorkHoursProvider} from "./WorkHoursContext";
import {UserBookingsProvider} from "../Booking/UserBookingsContext";
import PageLoading from "../Widgets/PageLoading";


export default function CateringEstablishment () {
  const [mainInfo, dispatchMainInfo] = useReducer(cateringEstablishmentMainInfoReducer, null);
  const [userRating, setUserRating] = useState(null);

  const {t} = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const establishmentId = params.id;

  const getMainInfo = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENT_MAIN_INFO_URL.replace('[pk]', establishmentId)
        ),
      },
      navigate,
    )
    .then(response => {
      dispatchMainInfo({type: CateringEstablishmentMainInfoChangeType.ENTIRE_DATA_UPDATE, payload: response.data});
    })
  }, [navigate, establishmentId]);

  const getUserRatingForEstablishment = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_USER_RATING_URL}?`
          + `establishment=${establishmentId}&`
        ),
      },
      navigate,
    )
      .then(response => setUserRating(response.data['rating']))
      .catch(_ => setUserRating(0));
  }, [navigate, establishmentId]);

  useEffect(() => {
    (async () => {
      await getMainInfo();
      await getUserRatingForEstablishment();
    })();
  }, [getMainInfo, getUserRatingForEstablishment]);

  const handleUserRatingChange = rating => {
    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_USER_RATING_URL}`,
        method: 'post',
        data: {rating: rating, catering_establishment: establishmentId},
      },
    )
      .then(response => {
        dispatchMainInfo({
          type: CateringEstablishmentMainInfoChangeType.RATING_CHANGE,
          payload: response.data['avg_rating'],
        });
      });
    setUserRating(rating);
  }

  if (mainInfo === null) {
    return <PageLoading />;
  }

  return (
    <TablesProvider>
      <WorkHoursProvider>
        <UserBookingsProvider>
          <div className='page-content-wrapper'>
            <div className='page-name'>{mainInfo['name']}</div>
            <div className='catering-establishment-main-info-wrapper'>
              <div className='catering-establishment-main-info-float'>
                <Carousel>
                  {
                    mainInfo['photos'].map((photo, index) =>
                      <Carousel.Item key={index}>
                        <img src={photo} />
                      </Carousel.Item>
                    )
                  }
                </Carousel>
                <div className='details'>
                  <div>{t('Location')}:</div>
                  <div className='location-info'>{mainInfo['address']}</div>
                  <div>{t('Average grade')}:</div>
                  <div className='rating'>
                    <span className='star'>★</span>
                    <div>{mainInfo['rating']}</div>
                  </div>
                  <div>{t('Your grade')}:</div>
                  <div>
                    {
                      userRating === null
                        ? <Spinner animation="border" variant="primary" />
                        : <ReactStars
                            count={5}
                            value={userRating}
                            onChange={handleUserRatingChange}
                            size={50}
                            isHalf={false}
                            activeColor="#f0cc16"
                          />
                    }
                  </div>
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>{mainInfo['description']}</div>
            </div>
            <div className='both-float-cleared'>
              <Menu />
            </div>
            <Feedbacks />
          </div>
        </UserBookingsProvider>
      </WorkHoursProvider>
    </TablesProvider>
  )
}
