import {Choice} from "../../utils/choices";


export const PERCENT_DISCOUNT = new Choice('percent', 'Percent');
export const CASH_VALUE_DISCOUNT = new  Choice('cash_value', 'Cash value');
export const DISCOUNT_TYPES = [PERCENT_DISCOUNT, CASH_VALUE_DISCOUNT];
