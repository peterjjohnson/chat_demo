// Subscribe to our publications
Meteor.subscribe('channels');
Meteor.subscribe('usernames');

Template.messages.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe('messages', Session.get('channel'));
    })
});