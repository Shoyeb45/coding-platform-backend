import { prisma } from "../utils/prisma";


async function main() {
    await prisma.roleAdmin.create({
        data: { role: "ADMIN" }
    });
    await prisma.roleAdmin.create({
        data: { role: "SUPER_ADMIN" }
    });

    

}