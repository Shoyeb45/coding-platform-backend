import { S3Service } from "./utils/s3client";

const s3 = S3Service.getInstance();

// List only media files
const mediaFiles = s3.listObjects("testcases/");
mediaFiles.then(d => {
    console.log(d);

})

// s3.getPreviewPresignedUrl("testcases/cme46mf170001n5246hnj2iw1/input/input5.txt")
//     .then(d => console.log(d)
//     )


// const d = ['testcases/cme46mf170001n5246hnj2iw1/input/input1.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input10.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input2.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input3.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input4.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input5.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input6.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input7.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input8.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/input/input9.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output1.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output10.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output2.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output3.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output4.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output5.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output6.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output7.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output8.txt',
//   'testcases/cme46mf170001n5246hnj2iw1/output/output9.txt']

// for (const e of d) {
//     s3.deleteObject(e)
//         .then(d => {
//             console.log("Deleted " + e);
//             console.log(d);
            
//         })
// }