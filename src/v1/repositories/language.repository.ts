import { prisma } from "../../utils/prisma";
import { TLanguageCreate } from "../types/programmingLanguage.type";

export class LanguageRepository {
    static create = async (data: TLanguageCreate) => {
        return await prisma.programmingLanguage.create({ data });
    }

    static getAll = async () => {
        return await prisma.programmingLanguage.findMany({ select: { id: true, name: true, judge0Code: true }});
    }

    static getByCode = async (judge0Code: number) => {
        return await prisma.programmingLanguage.findFirst({ where: { judge0Code }});
    }
}