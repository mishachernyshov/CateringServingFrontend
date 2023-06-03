import React from "react";
import {useTranslation} from "react-i18next";

import MenuItem from "./MenuItem";
import ReactPaginate from "react-paginate";
import {MARGIN_PAGES_DISPLAYED, PAGE_RANGE_DISPLAYED} from "../../data/constants/settings";


export default React.memo(function MenuContent({establishmentDishes, dishRelatedData, pagination, pageChangeHandler}) {
  const {t} = useTranslation();

  if (!establishmentDishes.length) {
    return (
      <div className='catalog-content-wrapper'>
        <div className='catalog-no-data-feedback-wrapper'>
          <div className='catalog-nothing-found-msg'>
            {t('Unfortunately, nothing is found. Please, change you search parameters.')}
         </div>
        </div>
      </div>
    )
  }

  return (
    <div className='catalog-content-wrapper'>
      <div className='catalog-items'>
        {
          establishmentDishes.map((establishmentDish, index) =>
            <MenuItem
              key={index}
              establishmentDish={establishmentDish}
              dishRelatedData={dishRelatedData}
            />
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
  )
});
