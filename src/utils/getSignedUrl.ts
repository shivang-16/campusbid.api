import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import S3 from "../aws/s3";

type InfoTypes = {
    Bucket: string,
    Key: string,
    ContentType: string
}
export const getPutObjectSignedUrl = async(info: InfoTypes) => {
    try {
        const command = new PutObjectCommand({
            Bucket: info.Bucket,
            Key: info.Key,
            ContentType: info.ContentType
        });

        const requestUrl = await getSignedUrl(S3, command)
        return requestUrl;
    } catch (error) {
        console.error("Error generating put signed URL:", error);
        throw error;
    }
}

export const getObjectSignedUrl = async(info: InfoTypes) => {
    try {
        const command = new GetObjectCommand({
            Bucket: info.Bucket,
            Key: info.Key,
        });
        const requestURL = await getSignedUrl(S3, command);
        return requestURL;
    } catch (error) {
        console.error("Error generating get signed URL:", error);
        throw error;
    }
}