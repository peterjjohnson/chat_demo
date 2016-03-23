Meteor.publish('messages', function(userId) {
    return Messages.find({
        $or: [
            {
                $and: [
                    {recipient: userId},
                    {user: this.userId}
                ]
            },
            {
                $and: [
                    {recipient: this.userId},
                    {user: userId}
                ]
            }
        ]
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