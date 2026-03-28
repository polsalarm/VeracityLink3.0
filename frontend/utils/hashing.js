/**
 * Generates a SHA-256 hash from a File object.
 * @param {File} file 
 * @returns {Promise<string>} Hex encoded hash
 */
export const hashFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Generates a SHA-256 hash from a string.
 * @param {string} message 
 * @returns {Promise<string>} Hex encoded hash
 */
export const hashString = async (message) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};
