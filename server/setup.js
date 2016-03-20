Meteor.startup(function() {
    if (!Channels.find({name: 'general'}).count()) {
        Channels.insert({
            name: 'general'
        });
    }
    if (!Channels.find({name: 'random'}).count()) {
        Channels.insert({
            name: 'random'
        });
    }
});