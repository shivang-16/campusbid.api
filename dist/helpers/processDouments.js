"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudio = exports.processAvatar = exports.processFiles = exports.processDocuments = void 0;
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
const processFiles = async (files) => {
    if (!files || !Array.isArray(files)) {
        return [];
    }
    return await Promise.all(files.map(async (doc) => {
        if (doc === null)
            return;
        const bucketKey = `files/${new Date().getTime()}-${doc.fileName}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME,
            Key: bucketKey,
            ContentType: doc.type,
        };
        const putSignedUrl = await (0, getSignedUrl_1.getPutObjectSignedUrl)(putObjectInfo);
        return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey, ...doc };
    }));
};
exports.processFiles = processFiles;
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
const processAudio = async (audio) => {
    if (!audio)
        return null;
    const bucketKey = `audio/${new Date().getTime()}-${audio.fileName}`;
    const putObjectInfo = {
        Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME,
        Key: bucketKey,
        ContentType: audio.type,
    };
    // Get the pre-signed URL for uploading the audio file
    const putSignedUrl = await (0, getSignedUrl_1.getPutObjectSignedUrl)(putObjectInfo);
    // Return the pre-signed URL and other metadata
    return {
        putUrl: putSignedUrl,
        getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`,
        key: bucketKey,
        ...audio,
    };
};
exports.processAudio = processAudio;
