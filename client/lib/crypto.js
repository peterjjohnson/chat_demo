/**
 * Convert a byte array to base64
 *
 * @param byteArray
 *
 * @returns {string}
 */
byteArrayToBase64 = function(byteArray){
    var binaryString = "";
    for (var i = 0; i < byteArray.byteLength; i++){
        binaryString += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(binaryString);
};

/**
 * Convert a base64 string to a byte array
 *
 * @param base64String
 *
 * @returns {Uint8Array}
 */
base64ToByteArray = function(base64String){
    var binaryString = window.atob(base64String);
    var byteArray = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++){
        byteArray[i] += binaryString.charCodeAt(i);
    }
    return byteArray;
};

/**
 * Convert a byte array to a string
 *
 * @param byteArray
 *
 * @returns {*}
 */
byteArrayToString = function(byteArray){
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
};

/**
 * Convert a string to a byte array
 *
 * @param s
 *
 * @returns {*}
 */
stringToByteArray = function(s){
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
};

/**
 * Base64 encode a key
 *
 * @param key
 *
 * @returns {string}
 */
keyToBase64 = function(key) {
    return byteArrayToBase64(new Uint8Array(key));
};

/**
 * Encrypt a message's text and then send the message to the server
 *
 * @param message
 */
encrypt = function(message) {
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
};

/**
 * Decrypt a message's text and then update the display for that message
 *
 * @param message
 */
decrypt = function(message) {
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
        });
    });
};

/**
 * Generate an encryption key pair and then store the public key in the database
 * while keeping the private key in the browser.
 */
generateKeyPair = function() {
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
};