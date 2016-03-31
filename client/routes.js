Router.configure({
    layoutTemplate: 'app'
});

Router.route('/', function() {
    if (Meteor.userId()) {
        var user = Meteor.users.findOne({_id: {$ne: Meteor.userId()}});
        this.redirect('/' + user._id);
    } else {
        this.render('default');
    }
});

Router.route('/:userId', function() {
    Session.set('userId', this.params.userId);
    this.render('messages');
});