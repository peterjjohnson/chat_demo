/**
 * Listings template events
 */
Template.listings.events({
    'change #user-list': function() {
        Router.go('/' + $('#user-list :selected').val());
    }
});

/**
 * Footer template events
 */
Template.footer.events({
    // Listen for CR and encrypt/store a message
    'keypress #message-text': function(event) {
        var inputBox = $('#message-text');
        var charAscii = (typeof event.which == 'number') ? event.which : event.charCode;
        if (charAscii == 13) {
            event.stopPropagation();
            encrypt({text: inputBox.val(), recipient: Session.get('userId')});
            inputBox.val('');
            return false;
        }
    }
});