import {DropdownButton} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import {useTranslation} from "react-i18next";
import React from "react";

import SortingOrderingType from "../../data/enums/sortingOrderingType";
import SortingChangeType from "../../data/enums/sortingChangeType";


export default React.memo(function Sorting ({parameters, sortingState, dispatchSortingState}) {
  const {t} = useTranslation();

  const changeOrderingType = orderingType => {
    dispatchSortingState({type: SortingChangeType.ORDERING_CHANGE, payload: orderingType});
  }

  const changeOrderingParameter = orderingParameter => {
    dispatchSortingState({type: SortingChangeType.PARAMETER_CHANGE, payload: orderingParameter});
  }

  return (
    <div className='sorting-wrapper'>
      <div>{t('Sorting')}</div>
      <div className='sorting-buttons-wrapper'>
        <DropdownButton
          variant='primary'
          title={t(sortingState.parameter.verboseName)}
        >
          {
            parameters.map(parameter =>
              <Dropdown.Item
                key={parameter.name}
                active={sortingState.parameter === parameter}
                onClick={_ => changeOrderingParameter(parameter)}
              >
                {t(parameter.verboseName)}
              </Dropdown.Item>
            )
          }
        </DropdownButton>
        <DropdownButton
          variant='primary'
          title={t(sortingState.ordering.verboseTypeName)}
        >
          <Dropdown.Item
            key={SortingOrderingType.ASCENDING.typeName}
            active={sortingState.ordering === SortingOrderingType.ASCENDING}
            onClick={_ => changeOrderingType(SortingOrderingType.ASCENDING)}
          >
            {t(SortingOrderingType.ASCENDING.verboseTypeName)}
          </Dropdown.Item>
          <Dropdown.Item
            key={SortingOrderingType.DESCENDING.typeName}
            active={sortingState.ordering === SortingOrderingType.DESCENDING}
            onClick={_ => changeOrderingType(SortingOrderingType.DESCENDING)}
          >
            {t(SortingOrderingType.DESCENDING.verboseTypeName)}
          </Dropdown.Item>
        </DropdownButton>
      </div>
    </div>
  )
});
