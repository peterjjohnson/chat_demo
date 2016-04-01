Meteor.methods({
    newMessage: function(message) {
        message.timestamp = Date.now();
        message.user      = Meteor.userId();
        Messages.insert(message);
    },
    storePublicKey: function(publicKey) {
        Meteor.users.update({_id: Meteor.userId()}, { $set: {publicKey: publicKey} });
    },
    getPublicKey: function(userId) {
        var user = Meteor.users.findOne({_id: userId}, {fields: {publicKey: 1}});
        return user.publicKey;
    }
});