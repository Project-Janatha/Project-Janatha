import constants from '../constants.js';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function createUser(userItem) {
    try {
        await constants.docClient.send(new PutCommand({
            TableName: constants.USERS_TABLE,
            Item: userItem,
            ConditionExpression: "attribute_not_exists(username)"
        }));
        return true;
    } catch (err) {
        console.error("Error creating user:", err);
        return false;
    }
}

export async function getUserByUsername(username) {
    try {
        const command = new QueryCommand({
            TableName: constants.USERS_TABLE,
            IndexName: "UsernameIndex",
            KeyConditionExpression: "username = :u",
            ExpressionAttributeValues: { ":u": username }
        });
        const result = await constants.docClient.send(command);
        return result.Items ? result.Items[0] : null;
    } catch (err) {
        console.error("Error retrieving user:", err);
        return null;
    }
}

export async function getUserById(userId) {
    try {
        const command = new GetCommand({
            TableName: constants.USERS_TABLE,
            Key: { id: userId }
        });
        const result = await constants.docClient.send(command);
        return result.Item || null;
    } catch (err) {
        console.error("Error retrieving user by ID:", err);
        return null;
    }
}