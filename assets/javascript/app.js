//Initialize Firebase
const config = {
    apiKey: "AIzaSyCBd6cCyi76K_rcLHjDhHjGL8YrRfiXhgw",
    authDomain: "jh-bootcamp-hw.firebaseapp.com",
    databaseURL: "https://jh-bootcamp-hw.firebaseio.com",
    projectId: "jh-bootcamp-hw",
    storageBucket: "jh-bootcamp-hw.appspot.com",
    messagingSenderId: "477125458324"
};
firebase.initializeApp(config);

const database = firebase.database().ref('trainScheduler');

let trainArray = [];

//Button to submit new train form
$('#submit').on('click', function() {
    const routeName = $('#routeName').val().trim();
    const station = $('#station').val().trim();
    const startTime = $('#startTime').val().trim();
    const frequency = $('#frequency').val().trim();

    trainArray.push({
        'routeName': routeName,
        'station': station,
        'startTime': startTime,
        'frequency': frequency,
    });

    database.set(trainArray);
});

//Used during testing to quickly clear Firebase of stored objects
$('#clearDatabase').on('click', function() {
    trainArray = [];
    database.set(trainArray);
    location.reload();
});

//For generating table rows
function generateNewRow(inputObj, index) {
    const newTBody = $('<tbody>');
    const newRow = $('<tr>');

    const initialTime = moment(inputObj.startTime, ['h:m a', 'H:m']);
    const difference = moment().diff(initialTime);
    const differenceMinutes = moment().diff(initialTime, 'minutes');
    let arrivalTime;
    let eta;

    if (differenceMinutes < 0) {
        eta = Math.abs(differenceMinutes);
        arrivalTime = inputObj.startTime;
    } else {
        eta = inputObj.frequency - differenceMinutes % inputObj.frequency;
        arrivalTime = moment().add(eta, 'minutes').format('HH:mm');
    }

    if (eta === 0 || eta === parseInt(inputObj.frequency)) {
        eta = 'Arrived';
    }


    newRow.append('<td>' + inputObj.routeName + '</td>');
    newRow.append('<td>' + inputObj.station + '</td>');
    newRow.append('<td>' + initialTime.format('HH:mm') + '</td>');
    newRow.append('<td>' + inputObj.frequency + '</td>');
    newRow.append('<td>' + arrivalTime + '</td>');
    newRow.append('<td>' + eta + '</td>');
    newRow.append('<td><button class=\'btn btn-default removeThis\' value=\'' + index + '\'>X</button></td>');

    newTBody.html(newRow);
    $('#employeeTable').append(newTBody);
}

//Remove row from table
$(document).on('click', '.removeThis', function() {
    const removeIndex = parseInt($(this).val());
    console.log(trainArray.splice(removeIndex, 1));
    database.set(trainArray);
});

//database.orderByChild('startDate').limitToLast(1).on('child_added', function(snapshot) {
//database.orderByChild('startDate').limitToLast(1).on('value', function(snapshot) {
database.on('value', function(snapshot) {
    const sv = snapshot.val();
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

//Refreshes table display
function refreshTable(inputArray) {
    $('#employeeTable tbody').empty();
    trainArray.forEach(generateNewRow);
}

//Frefreshes everything, still pending if it will have extra use
function refreshAll() {
    refreshTable(trainArray);
}

//Refreshes table display every 5 seconds
const intervalID = setInterval(refreshAll, 5000);

