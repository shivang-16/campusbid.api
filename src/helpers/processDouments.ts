import { getPutObjectSignedUrl } from "../utils/getSignedUrl";


export const processDocuments = async(docs: any) => {
    if (!docs || !Array.isArray(docs)) {
        return [];
      }
    
    return await Promise.all(docs.map(async (doc) => {
        if (doc === null) return
        const bucketKey = `docs/${new Date().getTime()}-${doc.fileName}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME!,
            Key: bucketKey,
            ContentType: doc.type,
          };

          const putSignedUrl = await getPutObjectSignedUrl(putObjectInfo)
          return { putUrl: putSignedUrl, getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`, key: bucketKey, ...doc };
    }))
}

export const processFiles = async(files: any) => {
    if (!files || !Array.isArray(files)) {
        return [];
      }

      console.log(files)
    
    return await Promise.all(files.map(async (doc) => {
        if (doc === null) return
        const bucketKey = `files/${new Date().getTime()}-${doc.fileName}`;
        const putObjectInfo = {
            Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME!,
            Key: bucketKey,
            ContentType: doc.type,
          };

          const putSignedUrl = await getPutObjectSignedUrl(putObjectInfo)
          console.log(putSignedUrl)
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

export const processAudio = async(audio: any) => {
  if (!audio) return null;

  const bucketKey = `audio/${new Date().getTime()}-${audio.fileName}`;
  const putObjectInfo = {
      Bucket: process.env.CAMPUSBID_S3_BUCKET_NAME!,
      Key: bucketKey,
      ContentType: audio.type,
  };

  // Get the pre-signed URL for uploading the audio file
  const putSignedUrl = await getPutObjectSignedUrl(putObjectInfo);

  // Return the pre-signed URL and other metadata
  return {
      putUrl: putSignedUrl,
      getUrl: `${process.env.CAMPUSBID_AWS_ACCOUNT_URL}/${bucketKey}`,
      key: bucketKey,
      ...audio,
  };
};