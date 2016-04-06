/**
 * Helper function to return a username when provided with a userId
 */
Template.registerHelper('usernameFromId', function(userId) {
    var user     = Meteor.users.findOne({_id: userId});
    var username = '';

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

Template.registerHelper('messageClasses', function(sender, option) {
    switch (option) {
        case 'offset':
            isSender = 'col-lg-push-2 col-md-push-2 col-sm-push-2';
            isRecip  = '';
            break;
        case 'panel':
            isSender = 'panel-primary';
            isRecip  = 'panel-default';
            break;
    }
    return sender == Meteor.userId() ? isSender : isRecip;
});

/**
 * Helper function for messages template to return a list of messages
 */
Template.messages.helpers({
    messages: function() {
        var messages = Messages.find();
        // Decrypt each message if we can
        messages.forEach(function(message) {
            // Get the current user's message key so they can decrypt this message
            Meteor.call('getMyMessageKey', message, function(err, key) {
                if (!err) {
                    decrypt(key, message.text).then(function(plainText) {
                        $('#' + message._id).text(byteArrayToString(plainText));
                    });
                }
            });
        });
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 'slow');
        return messages;
    }
});

/**
 * Helper function for listings template to return a list of users
 */
Template.listings.helpers({
    users: function() {
        return Meteor.users.find({ _id: { $ne: Meteor.userId() } });
    }
});

/**
 * Helper function to set the active user
 */
Template.user.helpers({
    selected: function() {
        var state = '';

        if (Session.get('userId') === this._id) {
            state = 'selected';
        }

        return state;
    }
});

