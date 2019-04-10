// Changing lat_lng to physical Address

function getAddress(coords){
  lat=coords["lat"]
  lng = coords["lng"]
  return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDC8qJSgf_e-ZSRb8c-I4j_Ucyf0R0t9Hk`
}



// for user location   - when the page loads, this should happen
navigator.geolocation.getCurrentPosition(function (lation) {
  // async

  var current_loc = new L.LatLng(lation.coords.latitude, lation.coords.longitude)
  address=getAddress(current_loc);
  d3.json(address,function(data){
    addressTemp = data["results"][0]["formatted_address"]
    d3.select("#from_places").attr("value", `${addressTemp}`)
  })


  var mymap = L.map('map').setView(current_loc, 13)
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: API_KEY
  }).addTo(mymap)
  
  var person = L.icon({
    iconUrl: 'characters1 copy.png',

    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  var marker = L.marker(current_loc,
    { icon: person }).bindPopup('you are here').addTo(mymap)

  d3.json("imageserver.geojson", function (data) {

    // L.geoJson function is used to parse geojson file and load on to map
    L.geoJson(data).addTo(mymap)

  });


  d3.select("#latlng").attr("value", `${current_loc["lat"]},${current_loc["lng"]}`)
}); // end navigator request




function renderMap(filter_condition) {

  // clear out the map
  var container = L.DomUtil.get('map');
  if (container != null) {
    container._leaflet_id = null;
  }

  navigator.geolocation.getCurrentPosition(function (lation) {
    // async
    console.log("in the callback")
    var current_loc = new L.LatLng(lation.coords.latitude, lation.coords.longitude)

    var mymap = L.map('map').setView(current_loc, 13)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: API_KEY
    }).addTo(mymap)
    var person = L.icon({
      iconUrl: 'characters1 copy.png',

      iconSize: [38, 95], // size of the icon
      shadowSize: [50, 64], // size of the shadow
      iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    var marker = L.marker(latlng,
      { icon: person }).bindPopup('you are here').addTo(mymap)

    d3.json("imageserver.geojson", function (data) {
      L.geoJson(data, {
        filter: function (feature, layer) {
          return feature.properties.limitingmag == filter_condition;
        }
      }).addTo(mymap)


    });



  }); // end navigator request

} // end render map


//  filter based on limiting mag

d3.select('#filter_dropdown').on('change', function () {
  userin = d3.select(this).property('value');
  // re-render my Map
  renderMap(userin)
  console.log(userin)
})





// google map location

$(function() {
  // add input listeners
  google.maps.event.addDomListener(window, 'load', function () {
      var from_places = new google.maps.places.Autocomplete(document.getElementById('from_places'));
      var to_places = new google.maps.places.Autocomplete(document.getElementById('to_places'));
      google.maps.event.addListener(from_places, 'place_changed', function () {
          var from_place = from_places.getPlace();
          var from_address = from_place.formatted_address;
          $('#origin').val(from_address);
      });
      google.maps.event.addListener(to_places, 'place_changed', function () {
          var to_place = to_places.getPlace();
          var to_address = to_place.formatted_address;
          $('#destination').val(to_address);
      });
  });
  // calculate distance
  function calculateDistance() {
      var origin = $('#origin').val();
      var destination = $('#destination').val();
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
          {
              origins: [origin],
              destinations: [destination],
              travelMode: google.maps.TravelMode.DRIVING,
              // we can change later https://developers.google.com/maps/documentation/javascript/distancematrix#travel_modes
              unitSystem: google.maps.UnitSystem.IMPERIAL, // miles and feet.
              // unitSystem: google.maps.UnitSystem.metric, // kilometers and meters.
              avoidHighways: false,
              avoidTolls: false
          }, callback);
  }
  // get distance results
  function callback(response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
          $('#result').html(err);
      } else {
          var origin = response.originAddresses[0];
          var destination = response.destinationAddresses[0];
          if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
              $('#result').html("Better get on a plane. There are no roads between "  + origin + " and " + destination);
          } else {
              var distance = response.rows[0].elements[0].distance;
              var duration = response.rows[0].elements[0].duration;
              console.log(response.rows[0].elements[0].distance);
              var distance_in_kilo = distance.value / 1000; // the kilom
              var distance_in_mile = distance.value / 1609.34; // the mile
              var duration_text = duration.text;
              var duration_value = duration.value;
              $('#in_mile').text(distance_in_mile.toFixed(2));
              $('#in_kilo').text(distance_in_kilo.toFixed(2));
              $('#duration_text').text(duration_text);
              $('#duration_value').text(duration_value);
              $('#from').text(origin);
              $('#to').text(destination);
          }
      }
  }
  // print results on submit the form
  $('#distance_form').submit(function(e){
      e.preventDefault();
      calculateDistance();
  });
});



