import React, {memo, useCallback, useEffect, useReducer, useState} from "react";
import {useTranslation} from "react-i18next";
import {makeAuthenticatedRequest} from "../../utils/request";
import {useNavigate, useParams} from "react-router-dom";
import {ListGroup} from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  CATALOG_PAGE_SIZE,
  FEEDBACKS_PAGE_SIZE,
  MARGIN_PAGES_DISPLAYED,
  PAGE_RANGE_DISPLAYED
} from "../../data/constants/settings";
import paginationReducer from "../../data/reducers/pagination";
import ReactPaginate from "react-paginate";
import PaginationChangeType from "../../data/enums/paginationChangeType";


export default memo(function () {
  const [feedbacks, setFeedbacks] = useState(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [pagination, dispatchPagination] = useReducer(
    paginationReducer,
    {number: 1, count: 1, lastChangeType: null},
  );

  const {t} = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const establishmentId = params.id;

  const getEstablishmentFeedbacks = useCallback(() => {
    let url = (
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_FEEDBACK_URL}?`
      + `catering_establishment=${establishmentId}&page_size=${FEEDBACKS_PAGE_SIZE}&`
    );
    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      url += `page=${pagination['number']}&`;
    }

    return makeAuthenticatedRequest({url: url}, navigate);
  }, [establishmentId, navigate, pagination]);

  const updateEstablishmentFeedbacks = useCallback(() => {
    return getEstablishmentFeedbacks()
      .then(response => {
        setFeedbacks(response.data['results']);
        dispatchPagination({
          type: PaginationChangeType.DATA_CHANGED,
          payload: Math.ceil(response.data['count'] / CATALOG_PAGE_SIZE),
        });
      });
  }, [getEstablishmentFeedbacks]);

  const postFeedback = () => {
    return makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_FEEDBACK_URL}`,
        method: 'post',
        data: {catering_establishment: establishmentId, feedback: newFeedback},
      },
      navigate,
    )
      .then(response => {
        const feedbackData = response.data;
        const updatedFeedbacks = [
          {
            visitor: t('You'),
            feedback: feedbackData['feedback'],
            created: feedbackData['created'],
          },
          ...feedbacks,
        ];
        if (updatedFeedbacks.length > FEEDBACKS_PAGE_SIZE) {
          updatedFeedbacks.pop();
        }
        setFeedbacks(updatedFeedbacks);
        setNewFeedback('');
        return updateEstablishmentFeedbacks();
      })
  }

  const applyFeedbacksPageData = useCallback(() => {
     return getEstablishmentFeedbacks()
      .then(response => {
        setFeedbacks(response.data['results']);
        dispatchPagination({type: PaginationChangeType.PAGE_DATA_APPLIED});
      });
  }, [getEstablishmentFeedbacks]);

  const handleNewFeedbackInput = event => {
    setNewFeedback(event.target.value);
  }

  const handlePageChange = useCallback(pageInfo => {
    dispatchPagination({type: PaginationChangeType.PAGE_NUMBER_CHANGED, payload: pageInfo.selected + 1});
  }, []);

  useEffect(() => {
    updateEstablishmentFeedbacks();
  }, []);

  useEffect(() => {
    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      applyFeedbacksPageData();
    }
  }, [applyFeedbacksPageData, pagination]);

  return (
    <div className='feedbacks'>
      <div className='subtitle'>{t('Feedbacks')}</div>
      {
        feedbacks === null
          ? <Spinner variant="primary" />
          : <ListGroup className='posted-feedbacks-wrapper'>
              {
                feedbacks.map((feedback, index) =>
                  <ListGroup.Item key={index}>
                    <div className='feedback-body'>
                      <div className='feedback-info'>
                        <div className='feedback-author'>{feedback['visitor']}</div>
                        <div>{t('date_format', {date: new Date(feedback['created'])})}</div>
                      </div>
                      <div className='feedback-content'>
                        {feedback['feedback']}
                      </div>
                    </div>
                  </ListGroup.Item>
                )
              }
            </ListGroup>
      }
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
          onPageChange={handlePageChange}
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
      <ListGroup>
        <ListGroup.Item>
          <div className='feedback-body'>
            <Form.Control
              value={newFeedback}
              onChange={handleNewFeedbackInput}
              as="textarea"
              rows={3}
            />
            <div className='feedback-action-wrapper'>
              <Button onClick={postFeedback}>
                {t('Post a feedback')}
              </Button>
            </div>
          </div>
        </ListGroup.Item>
      </ListGroup>
    </div>
  )
});
