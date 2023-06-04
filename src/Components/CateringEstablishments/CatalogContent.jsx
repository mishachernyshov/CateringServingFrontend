import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Card from 'react-bootstrap/Card';
import {BsFillStarFill} from "react-icons/bs";

import {
  CUT_CATERING_ESTABLISHMENTS_DESCRIPTION_LENGTH,
  MARGIN_PAGES_DISPLAYED,
  PAGE_RANGE_DISPLAYED,
} from "../../data/constants/settings";
import {getFilledAddressLocation, getFullLocationStringRepresentation} from "../../utils/location";
import ReactPaginate from 'react-paginate';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";


export default React.memo(function CatalogContent ({cateringEstablishments, locations, pagination, pageChangeHandler}) {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const redirectToEstablishmentPage = establishmentId => {
    navigate(`/catering_establishments/${establishmentId}`);
  }

  if (cateringEstablishments === null || locations === null) {
    return (
      <div className='catalog-content-wrapper'>
        <div className='catalog-no-data-feedback-wrapper'>
          <Spinner
            variant="primary"
            className="spinner-border big-loading-spinner"
          />
        </div>
      </div>
    )
  }

  if (!cateringEstablishments.length) {
    return (
      <div className='catalog-content-wrapper'>
        <div className='catalog-no-data-feedback-wrapper'>
          <div className='catalog-nothing-found-msg'>
            {t('Unfortunately, nothing is found. Please, change you search parameters.')}
         </div>
        </div>
      </div>
    );
  }

  return (
    <div className='catalog-content-wrapper'>
      <div className='catalog-items'>
        {
          cateringEstablishments.map((establishmentData, index) =>
            <div
              className='card-wrapper'
              key={index}
              onClick={_ => redirectToEstablishmentPage(establishmentData['id'])}
            >
              <Card>
                <Card.Img variant="top" src={establishmentData['photo']} />
                <Card.Header>{establishmentData['name']}</Card.Header>
                <Card.Body>
                  <Card.Text>
                    {establishmentData['description']}
                    {establishmentData['description'].length === CUT_CATERING_ESTABLISHMENTS_DESCRIPTION_LENGTH && '...'}
                  </Card.Text>
                  <div className='catalog-card-additional-info'>
                    <div className='rating'>
                      <BsFillStarFill />
                      <div>{establishmentData['rating'].toFixed(1)}</div>
                    </div>
                    <div className='catalog-address'>
                      {
                        getFullLocationStringRepresentation(
                          getFilledAddressLocation(
                            {
                              settlement: establishmentData['settlement'],
                              address: establishmentData['address'],
                            },
                            locations,
                          ),
                          locations,
                        )
                      }
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )
        }
      </div>
      {
        pagination.count > 1
        ? <ReactPaginate
          breakLabel="..."
          nextLabel={`${t('Next')} >`}
          forcePage={pagination.number - 1}
          pageRangeDisplayed={PAGE_RANGE_DISPLAYED}
          marginPagesDisplayed={MARGIN_PAGES_DISPLAYED}
          pageCount={pagination.count}
          previousLabel={`< ${t('Previous')}`}
          onPageChange={pageChangeHandler}
          renderOnZeroPageCount={null}
          breakClassName='page-item'
          breakLinkClassName='page-link'
          containerClassName="pagination justify-content-center"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          activeClassName="active"
        />
        : <></>
      }
    </div>
  );
});
