/**
 * Helper function for messages template to return a list of messages
 */
Template.messages.helpers({
    messages: function() {
        return Messages.find();
    }
});

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
 * Helper function for listings template to return a list of channels
 */
Template.listings.helpers({
    users: function() {
        return Meteor.users.find({ _id: { $ne: Meteor.userId() } });
    }
});

Template.user.helpers({
    active: function() {
        var state = '';

        if (Session.get('userId') === this._id) {
            state = 'active';
        }

        return state;
    }
});