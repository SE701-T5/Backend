import database from "mongoose";
import config from "./config.server.config";

/**
 * Configure and connect to MongoDB database
 * Uses environment variables:
 * @param uri optional database URI
 * @param options optional value to configure database connection
 */
export function connect(
  uri?: string,
  options?: database.ConnectOptions
): Promise<typeof database> {
  const databaseURI = uri ?? config.get("databaseURI");
  const databaseOptions = options ?? config.get("databaseOptions");

  return database.connect(databaseURI, databaseOptions);
}

/**
 * Returns database connection state
 * @returns {ConnectionStates} 0 for disconnected, 2 for connected, 1 for connecting, 3 for disconnecting
 */
export function getState() {
  return database.connection.readyState;
}

/**
 * Closes database connection
 * @returns {Promise<void>}
 */
export function closeConn() {
  return database.disconnect();
}
