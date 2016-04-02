/**
 * Allow users to create a username
 */
Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
});

/**
 * When a user logs in we need to see if they have a key pair.
 * If they don't, we'll generate one.
 */
Accounts.onLogin(function() {
    Meteor.call('getPublicKey', Meteor.userId(), function(error, publicKey) {
        if (typeof publicKey === 'undefined') {
            generateKeyPair();
        }
    });
});