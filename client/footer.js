Template.footer.events({
    'keypress input': function(event) {
        var inputBox = $('.input-box_text');
        var charAscii = (typeof event.which == "number") ? event.which : event.charCode;
        if (charAscii == 13) {
            event.stopPropagation();
            Meteor.call('newMessage', {text: inputBox.val()});
            inputBox.val("");
            return false;
        }
    }
});
