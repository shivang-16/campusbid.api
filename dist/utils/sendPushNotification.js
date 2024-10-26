"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
const sendPushNotification = async (pushTokens, heading, message, action) => {
    // Filter valid push tokens
    const validPushTokens = pushTokens.filter(pushToken => expo_server_sdk_1.Expo.isExpoPushToken(pushToken));
    if (validPushTokens.length === 0) {
        throw new Error("No valid Expo push tokens.");
    }
    const messages = validPushTokens.map(pushToken => ({
        to: pushToken,
        sound: "default",
        title: heading,
        body: `${message}\n\n${action}`,
        data: {
            withSome: "data",
            action: action,
            url: "#"
        },
    }));
    // Chunk the messages into batches
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    try {
        for (const chunk of chunks) {
            console.log("Sending chunk of messages:", chunk);
            // Send each chunk
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log("Ticket chunk received:", ticketChunk);
            tickets.push(...ticketChunk);
        }
    }
    catch (error) {
        console.error("Error sending push notifications:", error);
    }
    return tickets;
};
exports.sendPushNotification = sendPushNotification;
