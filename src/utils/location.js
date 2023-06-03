export const getCountry = (countryId, countries) => {
  return countries.find(country => country.id === countryId);
}

export const getCountryRegions = (countryId, regions) => {
  return regions.filter(region => region.country === countryId);
}

export const getRegion = (regionId, regions) => {
  return regions.find(region => region.id === regionId);
}

export const getRegionSettlements = (regionId, settlements) => {
  return settlements.filter(settlement => settlement.region === regionId);
}

export const getRegionCountry = (regionId, regions) => {
  return getRegion(regionId, regions).country;
}

export const getSettlement = (settlementId, settlements) => {
  return settlements.find(settlement => settlement.id === settlementId);
}

export const getSettlementRegion = (settlementId, settlements) => {
  return getSettlement(settlementId, settlements).region;
}

export const getFilledAddressLocation = (location, locations) => {
  const updatedLocation = {...location};
  updatedLocation.region = getSettlementRegion(updatedLocation.settlement, locations.settlements);
  updatedLocation.country = getRegionCountry(updatedLocation.region, locations.regions);

  return updatedLocation;
}

export const doesLocationHasMissedValues = location => {
  const locationFieldsOrder = ['country', 'region', 'settlement', 'address'];
  return Object.values(location).some(item => !!item) && !location[locationFieldsOrder[0]];
}

export const getFullLocationStringRepresentation = (location, locations) => {
  return (
    `${getCountry(location.country, locations.countries).name}, ${getRegion(location.region, locations.regions).name}, `
    + `${getSettlement(location.settlement, locations.settlements).name}, ${location.address}`
  );
}
