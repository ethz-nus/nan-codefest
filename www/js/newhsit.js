var cats = [];

Activity.find({}).limit(20).exec(function(err, activity){
  for(key = 0; key < activity.length; key++){
    console.log(activity[key].categories)
    for(i = 0; i < activity[key].categories.length; i++){
      if (cats.indexOf(activity[key].categories[i]) == -1){
        cats.push(activity[key].categories[i]);
      }
    }
  }}).addCallback(function(err){
    console.log(cats);
});
