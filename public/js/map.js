if (typeof mapToken !== 'undefined' && mapToken) {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style : "mapbox://styles/mapbox/streets-v12",
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        //we should replace our place location coordinates here
        //generallly for coordinates we give latitude then longitude but here in mapbox it is vice versa
        zoom: 9 // starting zoom
    });

// console.log(coordinates);
const marker = new mapboxgl.Marker({color : "red"})
    .setLngLat(listing.geometry.coordinates)//Listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({offset : 25})
    .setHTML(`<h4>${listing.location}</h4><p>Exact location provided after booking</p>`))
    .addTo(map);
}