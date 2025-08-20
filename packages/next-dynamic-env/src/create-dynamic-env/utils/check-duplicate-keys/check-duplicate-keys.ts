/**
 * Checks for duplicate keys between server and client configurations and warns
 * if any are found.
 *
 * Client values will take precedence when duplicates exist.
 *
 * @param clientKeys - Array of keys from client configuration
 * @param serverKeys - Array of keys from server configuration
 */
export const checkDuplicateKeys = <T>(
  clientKeys: Array<keyof T>,
  serverKeys: Array<keyof T>
): void => {
  const duplicateKeys = clientKeys.filter(key => serverKeys.includes(key));

  if (duplicateKeys.length > 0) {
    console.warn(
      `⚠️ The following environment variables are defined in both server and client configurations: ${duplicateKeys.join(', ')}.\n` +
        'Client values will take precedence.'
    );
  }
};
