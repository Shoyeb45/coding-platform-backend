import { prisma } from "./utils/prisma";

prisma.student.findMany({
    select: {
        name: true, batch: {
            select: {id: true, name: true}
        }
    }
}).then((d) => {console.log(d)})