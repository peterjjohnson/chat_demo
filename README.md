# Encrypted Chat Demo
## Meteor + Web Cryptography API

This is just a simple chat app built as a learning experience. It is a work in
progress.

It allows two users to send messages to each other using public key encryption via
the [Web Cryptography API](https://www.w3.org/TR/WebCryptoAPI/) to encrypt the
messages in transit as well as in the database. Public keys are stored on the server
while private keys never leave the client, thus ensuring that messages in the
database can only be deciphered by the intended recipient.

**Note:** *This is just a proof of concept and shouldn't be considered a complete
or secure encrypted messaging application.*