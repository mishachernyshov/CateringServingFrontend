export const getObject = (array, attributeName, attributeValue, many = false) => {
  const searchFunction = many ? 'filter' : 'find';
  return array[searchFunction](item => item[attributeName] === attributeValue);
}
