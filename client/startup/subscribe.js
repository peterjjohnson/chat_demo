// Subscribe to our publications
Meteor.subscribe('users');
Meteor.subscribe('usernames');

Template.messages.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe('messages', Session.get('userId'));
    })
});