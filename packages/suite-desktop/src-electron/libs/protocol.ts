export const isValidProtocol = (uri: string) =>
    PKG.PROTOCOLS.findIndex(p => uri.startsWith(`${p}:`)) > -1;
