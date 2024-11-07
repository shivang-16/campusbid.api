"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAvatar = exports.processDocuments = void 0;
const getSignedUrl_1 = require("../utils/getSignedUrl");
const processDocuments = async (docs) => {
    if (!docs || !Array.isArray(docs)) {
        return [];
    }
    return await Promise.all(docs.map(async (doc) => {
        if (doc === null)
            return;
        const bucketKey = `docs/${new Date().getTime()}-${doc.fileName}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME,
            Key: bucketKey,
            ContentType: doc.type,
        };
        const putSignedUrl = await (0, getSignedUrl_1.getPutObjectSignedUrl)(putObjectInfo);
        return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey, ...doc };
    }));
};
exports.processDocuments = processDocuments;
const processAvatar = async (avatar) => {
    if (avatar === null)
        return;
    const bucketKey = `avatar/${new Date().getTime()}-${avatar.name}`;
    const putObjectInfo = {
        Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME,
        Key: bucketKey,
        ContentType: avatar.type,
    };
    const putSignedUrl = await (0, getSignedUrl_1.getPutObjectSignedUrl)(putObjectInfo);
    return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey };
};
exports.processAvatar = processAvatar;
