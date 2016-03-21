Meteor.publish('messages', function(username) {
    return Messages.find({
        user: username
    });
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
   return Meteor.users.find({});
});