// Jaipur shop coordinates and delivery radius utility

export const SHOPS = [
  {
    id: 'vaishali',
    name: 'Vaishali Nagar Branch',
    locationName: 'Near Amrapali Circle, Jaipur',
    lat: 26.9082,
    lng: 75.7485,
    radiusKm: 5.5, // 5-6 km delivery radius
    contact: '+91 98290 12345',
    color: '#3b82f6'
  },
  {
    id: 'malviya',
    name: 'Malviya Nagar Branch',
    locationName: 'Near Gaurav Tower (GT), Jaipur',
    lat: 26.8522,
    lng: 75.8194,
    radiusKm: 5.5,
    contact: '+91 98290 54321',
    color: '#ec4899'
  },
  {
    id: 'mansarovar',
    name: 'Mansarovar Branch',
    locationName: 'Near Mansarovar Metro Station, Jaipur',
    lat: 26.8659,
    lng: 75.7663,
    radiusKm: 5.5,
    contact: '+91 98290 98765',
    color: '#10b981'
  },
  {
    id: 'rajapark',
    name: 'Raja Park Branch',
    locationName: 'Near Raja Park Gali No. 4, Jaipur',
    lat: 26.8974,
    lng: 75.8291,
    radiusKm: 5.5,
    contact: '+91 98290 11111',
    color: '#f59e0b'
  },
  {
    id: 'cscheme',
    name: 'C-Scheme Branch',
    locationName: 'Near Panch Batti, Jaipur',
    lat: 26.9168,
    lng: 75.8016,
    radiusKm: 5.5,
    contact: '+91 98290 22222',
    color: '#8b5cf6'
  }
];

// Calculate distance in km using the Haversine formula
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Find nearest shop and distance to it
export function checkDeliveryEligibility(lat, lng) {
  let nearestShop = null;
  let minDistance = Infinity;

  SHOPS.forEach((shop) => {
    const dist = getDistanceKm(lat, lng, shop.lat, shop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestShop = shop;
    }
  });

  const isEligible = minDistance <= (nearestShop ? nearestShop.radiusKm : 5.5);

  return {
    isEligible,
    nearestShop,
    distanceKm: minDistance,
    radiusLimit: nearestShop ? nearestShop.radiusKm : 5.5
  };
}
