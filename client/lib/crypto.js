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
    var rawKey;
    // Get the recipient's public key
    Meteor.call('getPublicKey', message.recipient, function(err, key) {
        if (!err) {
            window.crypto.subtle.importKey(
                'spki',
                base64ToByteArray(key),
                {name: 'RSA-OAEP', hash: 'SHA-256'},
                false,
                ['encrypt']
            ).then(function(publicKey) {
                // Now we've got the public key, generate a random key for this message
                window.crypto.subtle.generateKey(
                    {name: 'AES-CBC', length: 256},
                    true,
                    ['encrypt', 'decrypt']
                ).then(function(messageKey) {
                    // Generate initialisation vector and append the message at the end
                    var ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
                    var oldMessage = stringToByteArray(message.text);
                    var newMessage = new Uint8Array(16 + oldMessage.length);
                    newMessage.set(ivBytes);
                    newMessage.set(oldMessage, 16);
                    // Use the message key and IV to encrypt the message
                    window.crypto.subtle.encrypt(
                        {name: 'AES-CBC', iv: ivBytes},
                        messageKey,
                        newMessage
                    ).then(function(cipherText) {
                        message.text = byteArrayToBase64(new Uint8Array(cipherText));
                        // Get the raw message key so we can encrypt it and store it
                        window.crypto.subtle.exportKey(
                            'raw',
                            messageKey
                        ).then(function(rawMessageKey) {
                            rawKey = rawMessageKey;
                            // Encrypt and store the message key so the recipient can decrypt it
                            window.crypto.subtle.encrypt(
                                {name: 'RSA-OAEP'},
                                publicKey,
                                rawMessageKey
                            ).then(function(encryptedMessageKey) {
                                message.recipientKey = byteArrayToBase64(new Uint8Array(encryptedMessageKey));
                                // Get the sender's public key
                                Meteor.call('getPublicKey', Meteor.userId(), function(err, key) {
                                    if (!err) {
                                        window.crypto.subtle.importKey(
                                            'spki',
                                            base64ToByteArray(key),
                                            {name: 'RSA-OAEP', hash: 'SHA-256'},
                                            false,
                                            ['encrypt']
                                        ).then(function(publicKey) {
                                            // Encrypt and store the message key so the sender can decrypt it
                                            window.crypto.subtle.encrypt(
                                                {name: 'RSA-OAEP'},
                                                publicKey,
                                                rawKey
                                            ).then(function(encryptedKey) {
                                                message.senderKey = byteArrayToBase64(new Uint8Array(encryptedKey));
                                                // The message is ready to hit the server, let's store it
                                                Meteor.call('newMessage', message);
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        }
    });
};

/**
 * Pass cipher text to crypto.subtle.decrypt and return the promise of plain text
 *
 * @param key
 * @param cipherText
 */
decrypt = function(key, cipherText) {
    // Split out the IV and message cipher
    cipherText = base64ToByteArray(cipherText);
    var ivBytes = new Uint8Array(cipherText.slice(0, 16));
    var cipher  = new Uint8Array(cipherText.slice(16));
    // Get the user's private key from local storage
    return window.crypto.subtle.importKey(
        'pkcs8',
        base64ToByteArray(localStorage.getItem('pkey')),
        {name: 'RSA-OAEP', hash: 'SHA-256'},
        false,
        ['decrypt']
    ).then(function(privateKey) {
        // Use the private key to decrypt the message key
        return window.crypto.subtle.decrypt(
            {name: 'RSA-OAEP'},
            privateKey,
            base64ToByteArray(key)
        ).then(function(rawMessageKey) {
            return window.crypto.subtle.importKey(
                'raw',
                rawMessageKey,
                {name: 'AES-CBC', length: 256},
                false,
                ['decrypt']
            ).then(function(messageKey) {
                // Finally, use the decrypted message key and IV to decrypt the message text
                return window.crypto.subtle.decrypt(
                    {name: 'AES-CBC', iv: ivBytes},
                    messageKey,
                    cipher
                )
            })
        })
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
            localStorage.setItem('pkey', keyToBase64(privateKey));
        });
    });
};