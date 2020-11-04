export const isValidProtocol = (uri: string) => {
    if (!process.env.PROTOCOLS) {
        return false;
    }

    const protocols = (process.env.PROTOCOLS as unknown) as string[];
    return protocols.findIndex(p => uri.startsWith(`${p}:`)) > -1;
};
