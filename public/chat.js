var socket = io('');

    socket.on('connect', function () {
        console.log('connect to server');
        var params = $.deparam(window.location.search);


    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('get params value', params);
        }
    });
});



socket.on('disconnect', function () {
    console.log('disconnect from server');
});

socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    // show content on website
    $('#messages').append('<li>' + message.from  +  ": " + '</li>');
    $('#messages').append('<li>'+ message.text + " " + message.createdAt +'</li>');
   
});

socket.on('newLocationMessage', function (message) {
    console.log('newLocationMessage', message);
    // show content on website
    $('#messages').append('<li>' + message.from + " " + message.createdAt + ":" + '<a target="_blank" href=' + message.location + '>My Current Location</a></li>');

});

socket.on('image-uploaded', function (message) {

    $('#messages').append('<li>' + message.from + '</li>');
    $('#messages').append("<li><img height='200px' src="+message.name+"></li>");
    $('#messages').append('<li>' + message.createdAt + '</li>');
 
   
});


socket.on('updateUserList', function (data) {
    console.log('userlist:', data);
    var ol = $('<ol></ol>');

    data.forEach(function (user) {
        ol.append($('<li></li>').text(user));
    });
    jQuery('#users').html(ol);
});





$('#message-form').on('submit', function (e) {
    e.preventDefault();
    var messageTextbox = jQuery('[name=message]');
    socket.emit('createMessage', {
        text: messageTextbox.val()
    });
    //clear input form after submit
    messageTextbox.val('');
});


    var file = document.getElementById('my-file');
    file.addEventListener('change', function () {
    
    var firstFile = file.files[0],
        reader = new FileReader();

    reader.onloadend = function () {
        socket.emit('upload-image', {
            name: firstFile.name,
            data: reader.result
        });
    };
    reader.readAsArrayBuffer(firstFile);
    $('#my-file').val('');
});




$('#send-location').on('click', function (e) {
    e.preventDefault();
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }
    $('#send-location').attr("disabled", "disabled").text('Sending location');

    //navigator.geolocation.getCurrentPosition(success, error, [options])
    navigator.geolocation.getCurrentPosition(function (position) {
        $('#send-location').removeAttr("disabled").text('Send location');
        socket.emit('createLocationMessage', {
            from: 'User',
            latitude: position.coords.latitude,
            longtitude: position.coords.longitude
        });
    }, function () {
        $('#send-location').removeAttr("disabled").text('Send location');
        alert('Unable to fetch location');
    });
});
