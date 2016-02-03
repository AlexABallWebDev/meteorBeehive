Observations = new Mongo.Collection('observations');

//the "homepage" for this site is the mite
//data entry form.
Router.route('/', function() {
	this.render('miteForm');
	this.layout('layout');
});

if (Meteor.isClient) {
  //subscribe to get the Observations collection.
	Meteor.subscribe("observations");
	
	Template.beeDataTable.helpers({
		//returns all observations, or an empty
		//object if Observations is invalid.
		"observations": function() {
			return Observations.find({}, {sort: {submissionDate: -1}}) || {};
		}
	});
	
	Template.miteForm.events({
		"submit form": function(event) {
			//prevent default submission of the form so that the
			//below code handles the form instead.
			event.preventDefault();
			
			//save the form input boxes to variables.
			var hiveNameBox =
						$(event.target).find('input[name=hiveName]');
			var observationDateBox =
						$(event.target).find('input[name=observationDate]');
			var observationDurationBox =
						$(event.target).find('input[name=observationDuration]');
			var miteCountBox =
						$(event.target).find('input[name=miteCount]');
			
			//get the form data out of the boxes.
			var hiveNameText = hiveNameBox.val();
			var observationDateText = observationDateBox.val();
			var observationDurationText = observationDurationBox.val();
			var miteCountText = miteCountBox.val();
			
			//check if any inputs are empty.
			if (hiveNameText.length > 0 &&
					observationDateText.length > 0 &&
					observationDurationText.length > 0 &&
					miteCountText.length > 0) {
				var emptyInput = false;
			}
			else
			{
				var emptyInput = true;
			}
			
			//if input is empty, show an error. otherwise, insert
			//form data into Observations collection.
			if (emptyInput) {
				alert("You must enter data into each field!");
			}
			else
			{
				//insert an entry into the Observations collection
				Observations.insert({
					"hiveName": hiveNameText,
					"observationDate": observationDateText,
					"observationDuration": observationDurationText,
					"miteCount": miteCountText,
					"submissionDate": Date.now()
				});
				
				//clear the inputs after an entry is added.
				hiveNameBox.val("");
				observationDateBox.val("");
				observationDurationBox.val("");
				miteCountBox.val("");
				
				//show beeDataTable below the form.
				$('#beeDataTable').show();
			}
		}
	})
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
	
	//publish the Observations collection.
	Meteor.publish("observations", function() {
		return Observations.find();
	});
}
