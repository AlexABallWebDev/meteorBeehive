Observations = new Mongo.Collection('observations');

//the "homepage" for this site is the mite
//data entry form.
Router.route('/', function() {
	this.render('mite-form');
	this.layout('layout');
});

if (Meteor.isClient) {
  //subscribe to get the Observations collection.
	Meteor.subscribe("observations");
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
	
	//publish the Observations collection.
	Meteor.publish("observations", function () {
		return Observations.find();
	});
}
