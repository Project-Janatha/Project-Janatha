/**
 * dynamoConfig.js
 * 
 * This file contains the configuration for DynamoDB client.
 */

export function getDynamoDBConfig() {
    return {
        region: process.env.AWS_REGION || "us-east-1",
        credentials : {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
    }
}

export const TABLES = {
    USERS: process.env.USERS_TABLE || "ChinmayaJanata-Users",
    CENTERS: process.env.CENTERS_TABLE || "ChinmayaJanata-Centers",
    EVENTS: process.env.EVENTS_TABLE || "ChinmayaJanata-Events"
};