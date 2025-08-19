import { prisma } from "./utils/prisma";

prisma.programmingLanguage.create({
    data: {
        name: "C",
        judge0Code: 103
    }
}).then((d) => {console.log("done")})