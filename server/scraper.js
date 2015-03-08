var xray = require('x-ray');
var geocoder = require('geocoder');
var mongoose = require('mongoose');

var activitySchema = mongoose.Schema({
  activityName: String,
  activityId: Number,
  startTime: Date,
  endTime: Date,
  loc: {
    longitude: Number,
    latitude: Number,
    formattedAdd: String
  },
  categories: [String],
  picUrl: String
});

var Activity = mongoose.model('Activity', activitySchema);

var mongoUri = 'mongodb://getaway.jellykaya.com/test'

mongoose.connect(mongoUri, function(err){
  if (err) {
    console.log("Cannot connect to getaway.jellykaya.com!")
    console.log(err);
  }else{
    console.log("Connected to getaway.jellykaya.com")
  }
});

/*
Remove all activities
*/

Activity.find({}).remove().exec();

var createActivity = function (activity, locData){
  if (activity.categories == undefined){
    activity.categories = [];
  }else{
    activity.categories = activity.categories
      .replace(new RegExp("\\n", 'g'), "")
      .replace(new RegExp("\\t", 'g'), "")
      .replace(new RegExp("\\+", 'g'), "").split(",");
  }
  console.log(activity.categories)
  new Activity({
    activityName: activity.activityName,
    activityId: activity.activityId,
    startTime: Date.parse(activity.startTime),
    endTime: undefined,
    loc: {
      longitude: locData.results[0].geometry.location.lat,
      latitude: locData.results[0].geometry.location.lng,
      formattedAdd: locData.results[0].formatted_address
    },
    categories: activity.categories,
    picUrl: "http://events.ch"+activity.picUrl
  }).save(function(err){
    if (err) {
      console.log("Error in saving activity");
      console.log(err);
    };
  });
}

for(i = 1; i < 2 ; i++){
  xray('http://events.ch/en/search/2015-03-08/s/'+i)
    .select([{
      $root: ".event",
      activityName: '.event-title a[title]',
      activityId: '.event',
      startTime: '.event-datetime time[datetime]',
      loc: {
        formattedAdd: '.venues-list a'
      },
      categories: '.categories-list li',
      picUrl: '.event-picture-link img[src]'
    }])
    .run(function(err, eventArray) {
      eventArray.forEach(function(activity, index, array){
        geocoder.geocode(activity.loc.formattedAdd
          , function ( err, data ) {
            createActivity(activity, data);
        });
      })
    });
  //blah
}
