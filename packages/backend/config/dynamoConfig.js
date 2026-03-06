/**
 * dynamoConfig.js
 * 
 * This file contains the configuration for DynamoDB client.
 */

export function getDynamoDBConfig() {
    const config = {
        region: process.env.AWS_REGION || "us-east-1",
        credentials : {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local"
        },
    }
    // When DYNAMODB_ENDPOINT is set (e.g. local dev), point the client there instead of AWS
    if (process.env.DYNAMODB_ENDPOINT) {
        config.endpoint = process.env.DYNAMODB_ENDPOINT
    }
    return config
}

export const TABLES = {
    USERS: process.env.USERS_TABLE || "ChinmayaJanata-Users",
    CENTERS: process.env.CENTERS_TABLE || "ChinmayaJanata-Centers",
    EVENTS: process.env.EVENTS_TABLE || "ChinmayaJanata-Events",
    MESSAGES: process.env.MESSAGES_TABLE || "ChinmayaJanata-Messages",
};