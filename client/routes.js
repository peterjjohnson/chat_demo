Router.configure({
    layoutTemplate: 'app'
});

Router.route('/', function() {
    var user = Meteor.users.findOne({ _id: { $ne: Meteor.userId() } });
    this.redirect('/' + user._id);
});

Router.route('/:userId', function() {
    Session.set('userId', this.params.userId);
    this.render('messages');
});