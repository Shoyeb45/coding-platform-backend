import { prisma } from "./utils/prisma";
import { S3Service } from "./utils/s3client";


prisma.submission.deleteMany({ where: { studentId: "0780f3fc-080a-404c-a3e0-09cce8c6e3cb"}})
.then((d) => {
    console.log(d)
})