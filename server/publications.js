Meteor.publish('messages', function(userId) {
    var messages = Messages.find({
        $or: [
            {
                recipient: userId,
                user:      this.userId
            },
            {
                recipient: this.userId,
                user:      userId
            }
        ]
    });
    
    return messages;
});

Meteor.publish('usernames', function() {
    return Meteor.users.find({}, {
        fields: {
            'username': 1,
            'services.github.username': 1
        }
    });
});

Meteor.publish('users', function() {
   return Meteor.users.find();
});