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

    static getAllUpcomingContests = async (studentId: string) => {
        const upcomingContests = await prisma.contest.findMany({
            where: {
                endTime: { gt: new Date() },
                batchContests: {
                    some: {
                        batch: {
                            students: {
                                some: {
                                    id: studentId,
                                },
                            },
                        },
                    },
                },
            },
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, creator: {
                    select: { id: true, name: true, email: true },
                }, tags: {
                    select: {
                        tag: {
                            select: {
                                name: true, id: true
                            }
                        }
                    }
                }
            }
        });

        return upcomingContests;
    }


    static getAllPublicProblems = async () => {
        return await prisma.problem.findMany({
            where: { isPublic: true },
            select: {
                id: true, title: true, difficulty: true, creator: {
                    select: {
                        id: true, email: true, name: true
                    }
                }, problemTags: {
                    select: {
                        tag: {
                            select: {
                                id: true, name: true
                            }
                        }
                    }
                }
            }
        });
    }
}