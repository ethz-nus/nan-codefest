var xray = require('x-ray');
var geocoder = require('geocoder');
var mongoose = require('mongoose');
var sleep = require('sleep');

var maxnum = 100;

var activitySchema = mongoose.Schema({
  activityId: String,
  startTime: Date,
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
  if (locData == undefined || locData.results[0] == undefined){
    return
  }
  new Activity({
    activityId: activity.activityId,
    startTime: Date.parse(activity.startTime),
    loc: {
      longitude: locData.results[0].geometry.location.lng,
      latitude: locData.results[0].geometry.location.lat,
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

var nextParse = function (num){
  if (num > maxnum){
    return
  }
  xray('http://events.ch/en/search/2015-03-08/s/' + num)
    .select([{
      $root: ".event",
      activityId: '.event-title a[title]',
      startTime: '.event-datetime time[datetime]',
      loc: {
        formattedAdd: '.venues-list a'
      },
      categories: '.categories-list li',
      picUrl: '.event-picture-link img[src]'
    }])
    .run(function(err, eventArray) {
      if (eventArray == undefined){
        return;
      }
      eventArray.forEach(function(activity, index, array){
        geocoder.geocode(activity.loc.formattedAdd
          , function ( err, data ) {
            createActivity(activity, data);
        });
      });
      console.log("Completed " + num + " of " + maxnum + " tries\t " + 1.0*num/maxnum*100 + "%");
      nextParse(num + 1);
  });
}

nextParse(1);
