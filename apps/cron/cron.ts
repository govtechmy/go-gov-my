const AWS = require("aws-sdk");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const _crypto = require("crypto");
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
  //service: "s3"
});
const s3 = new AWS.S3();

// const client = new S3Client({
//     accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
//     secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
//     region: "ap-southeast-2",
//     //service: "s3"
// });

// function generateSHA256Checksum(data) {
//     return _crypto.createHash('sha256').update(data, 'utf8').digest('hex');
// }

async function fetchData() {
  try {
    const response = await fetch(`${process.env.WEB_BASE}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function main() {
  const obj = await fetchData();
  console.log("obj", obj);
  const buf = Buffer.from(JSON.stringify(obj));
  console.log("size", buf);

  const command = new PutObjectCommand({
    Bucket: "test-bucket",
    Key: "stats.json",
    Body: buf,
  });

  //   try {
  //     const response = await client.send(command);
  //     console.log(response);
  //   } catch (err) {
  //     console.error(err);
  // }

  try {
    const res = await this.client.fetch(
      `${process.env.STORAGE_ENDPOINT}/stats.json`,
      {
        method: "PUT",
        body: buf,
      },
    );

    return "success";
  } catch (error) {
    console.log(error);
  }

  // const data = {
  //     Bucket: 'stats',
  //     Key: 'stats.json',
  //     Body: buf,
  //     ContentEncoding: 'base64',
  //     ContentType: 'application/json',
  //     ACL: 'public-read'
  // };
  // console.log("sending json file to s3....")
  // s3.upload(data, function (err) {
  //     if (err) {
  //         console.log('Error uploading data: ', err);
  //     } else {
  //         console.log('succesfully uploaded!!!');
  //     }
  // });
}

main();

// const salt = process.env.SALT
// console.log("salt", salt)

// fetch(`${process.env.WEB_BASE}/api/stats`)
// .then((response)=>response.json())
// .then((response)=>{
//     console.log(response)
//     const buf = Buffer.from(JSON.stringify(obj));

//     var data = {
//         Bucket: 'bucket-name',
//         Key: 'stats.json',
//         Body: buf,
//         ContentEncoding: 'base64',
//         ContentType: 'application/json',
//         ACL: 'public-read'
//     };

//     s3.upload(data, function (err, data) {
//         if (err) {
//             console.log(err);
//             console.log('Error uploading data: ', data);
//         } else {
//             console.log('succesfully uploaded!!!');
//         }
//     });
// })
