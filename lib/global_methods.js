Meteor.methods({
    newMessage: function(message) {
        message.timestamp = Date.now();
        message.user      = Meteor.userId();
        Messages.insert(message);
    },
    storePublicKey: function(publicKey) {
        Meteor.users.update({_id:Meteor.userId()}, {publicKey: publicKey});
    },
    getPublicKey: function(userId) {
        var user = Meteor.users.findOne({_id: userId}, {fields: {publickKey: 1}});
        return user.publicKey;
    }
});