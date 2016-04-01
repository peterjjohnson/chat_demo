Router.configure({
    layoutTemplate: 'app'
});

Router.route('/', function() {
    var user = Meteor.users.findOne({_id: {$ne: Meteor.userId()}});
    if (Meteor.userId() && user._id) {
        this.redirect('/' + user._id);
    } else {
        this.render('default');
    }
});

Router.route('/:userId', function() {
    Session.set('userId', this.params.userId);
    this.render('messages');
});