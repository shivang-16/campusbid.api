import { getPutObjectSignedUrl } from "../utils/getSignedUrl";


export const processDocuments = async(docs: any) => {
    if (!docs || !Array.isArray(docs)) {
        return [];
      }
    
    return await Promise.all(docs.map(async (doc) => {
        if (doc === null) return
        const bucketKey = `doc/${new Date().getTime()}-${doc.name}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME!,
            Key: bucketKey,
            ContentType: doc.type,
          };

          const putSignedUrl = await getPutObjectSignedUrl(putObjectInfo)
          return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey, ...doc };
    }))
}

export const processAvatar = async(avatar: any) => {
        if (avatar === null) return
        const bucketKey = `avatar/${new Date().getTime()}-${avatar.name}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME!,
            Key: bucketKey,
            ContentType: avatar.type,
          };

          const putSignedUrl = await getPutObjectSignedUrl(putObjectInfo)
          return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey };
}

