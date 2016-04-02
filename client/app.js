function byteArrayToBase64(byteArray){
    var binaryString = "";
    for (var i = 0; i < byteArray.byteLength; i++){
        binaryString += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(binaryString);
}

function base64ToByteArray(base64String){
    var binaryString = window.atob(base64String);
    var byteArray = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++){
        byteArray[i] += binaryString.charCodeAt(i);
    }
    return byteArray;
}

function byteArrayToString(byteArray){
    if ("TextDecoder" in window) {
        var decoder = new window.TextDecoder;
        return decoder.decode(byteArray);
    }

    // Otherwise, fall back to 7-bit ASCII only
    var result = "";
    for (var i = 0; i < byteArray.byteLength; i++){
        result += String.fromCharCode(byteArray[i])
    }
    return result;
}

function stringToByteArray(s){
    if ("TextEncoder" in window) {
        var encoder = new window.TextEncoder;
        return encoder.encode(s);
    }

    // Otherwise, fall back to 7-bit ASCII only
    var result = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++){
        result[i] = s.charCodeAt(i);
    }
    return result;
}

function keyToBase64(key) {
    return byteArrayToBase64(new Uint8Array(key));
}

function encrypt(message) {
    Meteor.call('getPublicKey', message.recipient, function(err, key) {
        if (err) {
            alert('error');
        } else {
            window.crypto.subtle.importKey(
                'spki',
                base64ToByteArray(key),
                {name: 'RSA-OAEP', hash: 'SHA-256'},
                false,
                ['encrypt']
            ).then(function(publicKey) {
                window.crypto.subtle.encrypt(
                    {name: 'RSA-OAEP'},
                    publicKey,
                    stringToByteArray(message.text)
                ).then(function(cipherText) {
                    message.text = byteArrayToBase64(new Uint8Array(cipherText));
                    Meteor.call('newMessage', message);
                });
            });
        }
    });
}

function decrypt(message) {
    window.crypto.subtle.importKey(
        'pkcs8',
        base64ToByteArray($('#private-key').val()),
        {name: 'RSA-OAEP', hash: 'SHA-256'},
        false,
        ['decrypt']
    ).then(function(privateKey) {
        window.crypto.subtle.decrypt(
            {name: 'RSA-OAEP'},
            privateKey,
            base64ToByteArray(message.text)
        ).then(function(decryptedText) {
            $('#' + message._id).text(byteArrayToString(decryptedText));
        }).catch(function(error) {
            console.log('fuck');
        });
    });
}

function generateKeyPair() {
    window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: {name: 'SHA-256'}
        },
        true,
        ['encrypt', 'decrypt']
    ).then(function(keyPair) {
        window.crypto.subtle.exportKey(
            'spki', keyPair.publicKey
        ).then(function(publicKey) {
            Meteor.call('storePublicKey', keyToBase64(publicKey));
        });
        window.crypto.subtle.exportKey(
            'pkcs8', keyPair.privateKey
        ).then(function(privateKey) {
            $('#private-key').val(keyToBase64(privateKey));
        });
    });
}

/**
 * Helper function to return a username when provided with a userId
 */
Template.registerHelper('usernameFromId', function(userId) {
    var user     = Meteor.users.findOne({_id: userId});
    var username = 'Anonymous';

    // See if we have a logged in user, either via GitHub or our app, and set the username accordingly
    if (typeof user.services.github !== 'undefined') {
        username = user.services.github.username;
    } else if  (typeof user.username !== 'undefined') {
        username = user.username;
    }

    return username;
});

/**
 * Given a timestamp, return a time string in the format hh:mm:ss
 */
Template.registerHelper('timestampToTime', function(timestamp) {
    var date    = new Date(timestamp);
    var hours   = date.getHours();
    var minutes = '0' + date.getMinutes();
    var seconds = '0' + date.getSeconds();

    return hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
});

/**
 * Helper function for messages template to return a list of messages
 */
Template.messages.helpers({
    messages: function() {
        var messages = Messages.find();
        messages.forEach(decrypt);
        return messages;
    }
});

/**
 * Helper function for listings template to return a list of users
 */
Template.listings.helpers({
    users: function() {
        return Meteor.users.find({ _id: { $ne: Meteor.userId() } });
    }
});

/**
 * Helper function to set the active user
 */
Template.user.helpers({
    active: function() {
        var state = '';

        if (Session.get('userId') === this._id) {
            state = 'active';
        }

        return state;
    }
});

Template.footer.events({
    'keypress input': function(event) {
        var inputBox = $('.input-box_text');
        var charAscii = (typeof event.which == 'number') ? event.which : event.charCode;
        if (charAscii == 13) {
            event.stopPropagation();
            encrypt({text: inputBox.val(), recipient: Session.get('userId')});
            inputBox.val('');
            return false;
        }
    },
    'click #decrypt-messages': function() {
        var messages = Messages.find();
        messages.forEach(decrypt);
    }
});

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Accounts.onLogin(function() {
    Meteor.call('getPublicKey', Meteor.userId(), function(error, publicKey) {
        if (typeof publicKey === 'undefined') {
            generateKeyPair();
        }
    });
});

