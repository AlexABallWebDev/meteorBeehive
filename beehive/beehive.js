Observations = new Mongo.Collection('observations');

//the "homepage" for this site is the mite
//data entry form.
Router.route('/', function() {
	this.render('miteForm');
	this.layout('layout');
});

//the "admin page" for this site is the bee
//data table.
Router.route('/admin', function() {
	this.render('beeDataTable');
	this.layout('layout');
});

Router.route('/hives/:hiveName', function() {
	this.render('beeSubTable', {
		data: function() {
			//the data being returned is an object containing the observations
			//that will be printed. This set of observations all have the same
			//name, which was typed into the url.
			return {obsSubset: Observations.find({hiveName: this.params.hiveName}, {sort: {submissionDate: -1}})};
		}
	});
	this.layout('layout');
});

//the export page is used to download an Excel spreadsheet of the
//data table.
Router.route('/export', function() {
	//credit to nicolaslopezj for creating the excel export package,
	//which was used for exporting the bee data table to an excel file.
	//link to the excel-export package by nocolaslopezj on atmospherejs:
	//https://atmospherejs.com/nicolaslopezj/excel-export

	//get the data from the observations collection (in reverse
	//chronological order)
	var data = Observations.find({}, {sort: {submissionDate: -1}}).fetch();

	//describe the columns in the excel file
  var fields = [
    {
      key: 'hiveName',
      title: 'Hive Name',
			type: 'string'
    },
    {
      key: 'observationDate',
      title: 'Observation Date',
			type: 'string'
    },
    {
      key: 'observationDuration',
      title: 'Observation Duration (Days)',
			type: 'number'
    },
		{
      key: 'miteCount',
      title: 'Mite Count',
			type: 'number'
    }
  ];

	//name the file and export the data to it.
  var title = 'Beehive-Data-Table';
  var file = Excel.export(title, fields, data);

	//send the excel file to the user (download window pops up, or file is
	//downloaded, etc.).
  var headers = {
    'Content-type': 'application/vnd.openxmlformats',
    'Content-Disposition': 'attachment; filename=' + title + '.xlsx'
  };

  this.response.writeHead(200, headers);
  this.response.end(file, 'binary');
}, {where: 'server'});

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

				//after the form is submitted, redirect the user to a page where
				//they can see their hive data (based on the hiveName they
				//entered into the form).
				Router.go('/hives/' + hiveNameText);

				//no longer used:
				//show beeDataTable below the form.
				//$('#beeDataTable').show();

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
