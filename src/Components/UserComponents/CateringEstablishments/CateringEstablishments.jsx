import {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import Card from 'react-bootstrap/Card';
import imagePlaceholder from '../../../images/image_placeholder.jpg';

import {makeAuthenticatedRequest} from "../../../utils/request";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";


export default function CateringEstablishments () {
  const [cateringEstablishments, setCateringEstablishments] = useState([]);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const getUserCateringEstablishments = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_OWNED_BY_USER_CATERING_ESTABLISHMENTS_URL,
      },
      navigate,
    );
  }, [navigate]);

  const navigateToStatistics = () => {
    navigate('/user_catering_establishments/statistics');
  };

  useEffect(() => {
    getUserCateringEstablishments()
      .then(response => {
        setCateringEstablishments(response.data['results']);
      });
  }, [getUserCateringEstablishments]);

  return (
    <>
      <div id='statistics-button-wrapper'>
        <Button onClick={navigateToStatistics}>{t('Statistics')}</Button>
      </div>
      <div className='cards-list page-content-wrapper'>
        {
          cateringEstablishments.map((item, index) =>
            <Card
              onClick={_ => navigate(`/user_catering_establishments/edit/${item.id}`)}
              className='interactive-card'
              key={index}
            >
              <Card.Body>
                <Card.Img src={item.photo ? item.photo : imagePlaceholder} />
                <div className='card-title'>
                  <div>{item.name}</div>
                </div>
              </Card.Body>
            </Card>
          )
        }
        <Card className='interactive-card' onClick={_ => navigate('/user_catering_establishments/new')}>
          <Card.Body>
            <div className='add-item-wrapper'>
              <div className='plus add-item'></div>
            </div>
            <div className='card-title'>
              <div>{t('Add new')}</div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
