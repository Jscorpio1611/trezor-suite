# Bitcoin Protocol
Trezor Suite, both on web and desktop, can handle the opening of URLs with the `bitcoin:` protocol.

## Behaviour on web
When opening Suite on web, it will prompt the user to associate the opening of `bitcoin:` URLs with Suite. By accepting, all `bitcoin:` URLs in the browser will open Suite. 

## Behaviour on desktop
By installing the desktop application, the `bitcoin:` protocol handler will be automatically registered in the system. The user will have the choice to use Suite Desktop to open `bitcoin:` URLs once or always (as default option).

## Structure
The implementation adheres to the [BIP29](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) specification (with the exception of the `label` and `message` parameters).

Valid parameters will create a draft for the first found Bitcoin account. A non-valid address will not create the draft and simply redirect the user to the send page. If a draft already exists, it won't be overwritten and the user will simply be redirected.

## Example
[bitcoin:3QmuBaZrJNCxc5Xs7aGzZUK8RirUT8jRKf?amount=0.001](bitcoin:3QmuBaZrJNCxc5Xs7aGzZUK8RirUT8jRKf?amount=0.001)