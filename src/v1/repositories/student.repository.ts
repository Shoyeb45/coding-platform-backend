import { prisma } from "../../utils/prisma"

export class StudentRepository {
    static getBatchId = async (studentId: string) => {
        return await prisma.student.findFirst({
            where: { id: studentId },
            select: {
                batch: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }
}