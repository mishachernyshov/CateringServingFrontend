export function objectsComparatorFactory (attribute) {
  return (firstItem, secondItem) => {
    if (firstItem[attribute] < secondItem[attribute]) {
      return -1;
    } else if (firstItem[attribute] > secondItem[attribute]) {
      return 1;
    }
    return 0;
  }
}
