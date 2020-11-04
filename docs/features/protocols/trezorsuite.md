# Trezor Suite protocol
For the destkop app, the `trezorsuite:` protocol can be used to set the state of the application based on parameters. It is for example possible to redirect a user to a defined page by providing a URL with this protocol.

For example, opening the send form would be done like this: [trezorsuite:accounts/send](trezorsuite:accounts/send).

Pages have to be allowed in the source of the application, otherwise no redirection will happen. You can see this list inside the `Protocol.tsx` component.
