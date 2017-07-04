//Initialize Firebase
var config = {
    apiKey: "AIzaSyCBd6cCyi76K_rcLHjDhHjGL8YrRfiXhgw",
    authDomain: "jh-bootcamp-hw.firebaseapp.com",
    databaseURL: "https://jh-bootcamp-hw.firebaseio.com",
    projectId: "jh-bootcamp-hw",
    storageBucket: "jh-bootcamp-hw.appspot.com",
    messagingSenderId: "477125458324"
};
firebase.initializeApp(config);

var database = firebase.database().ref('trainScheduler');

var trainArray = [];

$('#submit').on('click', function() {
    var routeName = $('#routeName').val().trim();
    var station = $('#station').val().trim();
    var startTime = $('#startTime').val().trim();
    var frequency = $('#frequency').val().trim();

    trainArray.push({
        'routeName': routeName,
        'station': station,
        'startTime': startTime,
        'frequency': frequency,
    });

    database.set(trainArray);
});

$('#clearDatabase').on('click', function() {
    trainArray = [];
    database.set(trainArray);
    location.reload();
});

function generateNewRow(inputObj, index) {
    var newTBody = $('<tbody>');
    var newRow = $('<tr>');

    var initialTime = moment(inputObj.startTime, ['h:m a', 'H:m']);
    var difference = moment().diff(initialTime);
    var differenceMinutes = moment().diff(initialTime, 'minutes');
    var arrivalTime;
    var eta;

    if (differenceMinutes < 0) {
        eta = Math.abs(differenceMinutes);
        arrivalTime = inputObj.startTime;
    } else {
        eta = inputObj.frequency - differenceMinutes % inputObj.frequency;
        arrivalTime = moment().add(eta, 'minutes').format('HH:mm');
    }

    if (eta === 0) {
        eta = 'Arrived';
    }


    newRow.append('<td>' + inputObj.routeName + '</td>');
    newRow.append('<td>' + inputObj.station + '</td>');
    newRow.append('<td>' + inputObj.startTime + '</td>');
    newRow.append('<td>' + inputObj.frequency + '</td>');
    newRow.append('<td>' + arrivalTime + '</td>');
    newRow.append('<td>' + eta + '</td>');
    newRow.append('<td><button class=\'btn btn-default removeThis\' value=\'' + index + '\'>X</button></td>');

    newTBody.html(newRow);
    $('#employeeTable').append(newTBody);
}

$(document).on('click', '.removeThis', function() {
    var removeIndex = parseInt($(this).val());
    console.log(trainArray.splice(removeIndex, 1));
    database.set(trainArray);
});

//database.orderByChild('startDate').limitToLast(1).on('child_added', function(snapshot) {
//database.orderByChild('startDate').limitToLast(1).on('value', function(snapshot) {
database.on('value', function(snapshot) {
    var sv = snapshot.val();
    //console.log(sv);

    if (sv === null) {
        database.set(trainArray);
    } else {
        trainArray = sv;
    }

    refreshTable(trainArray);
}, function(err) {
    console.log("Error handled" + err.code);
});

function refreshTable(inputArray) {
    $('#employeeTable tbody').empty();
    trainArray.forEach(generateNewRow);
}

function refreshAll() {
    refreshTable(trainArray);
}

var intervalID = setInterval(refreshAll, 15000);

