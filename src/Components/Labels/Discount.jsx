import React, {memo} from "react";

import {PERCENT_DISCOUNT, CASH_VALUE_DISCOUNT} from "../../data/constants/discountTypes";

export default memo(function DiscountLabel ({discountData}) {
  const getDiscountOutput = () => {
    switch (discountData['type']) {
      case PERCENT_DISCOUNT.name:
        return `-${discountData['amount']}%`;
      case CASH_VALUE_DISCOUNT.name:
        return `-₴${discountData['amount']}`;
    }
  }

  return (
    <div className='discount-ellipse'>
      <span>{getDiscountOutput()}</span>
    </div>
  );
});
