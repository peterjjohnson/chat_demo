Template.footer.events({
    'keypress input': function(event) {
        if (event.charCode == 13) {
            event.stopPropagation();
            $('.message-history').append('<div class="message"><a href="" class="message_profile-pic"></a><a href="" class="message_username">demo</a><span class="message_timestamp">12:30 AM</span><span class="message_star"></span><span class="message_content">' + $('.input-box_text').val() + '</span></div>');
            $('.input-box_text').val("");
            return false;
        }
    }
});
