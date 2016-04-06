/**
 * Methods available on both the client and server
 */
Meteor.methods({
    // Store a new message in the database
    newMessage: function(message) {
        message.timestamp = Date.now();
        message.user      = Meteor.userId();
        Messages.insert(message);
    },
    // Store a public key for a user
    storePublicKey: function(publicKey) {
        Meteor.users.update({ _id: Meteor.userId() }, { $set: { publicKey: publicKey } });
    },
    // Retrieve a user's public key
    getPublicKey: function(userId) {
        var user = Meteor.users.findOne({ _id: userId }, { fields: { publicKey: 1 } });
        return user.publicKey;
    },
    getMyMessageKey: function(message) {
        return Meteor.userId() == message.user ? message.senderKey : message.recipientKey;
    }
});