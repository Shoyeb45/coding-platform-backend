import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";
import { TTag } from "../types/tag.type";

export class TagRepository {
    static create = async (data: TTag) => {
        const createdTag = await prisma.tag.create({
            data: { name: data.name },
            select: {
                id: true, name: true
            }
        });

        return createdTag;
    }


    static getTagByName = async (name: string) => {
        const tag = await prisma.tag.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            },
            select: {
                id: true, name: true
            }
        });
        return tag;
    }

    static update = async (id: string, data: TTag) => {
        const updatedTag = await prisma.tag.update({
            data: {
                name: data.name
            },
            where: {
                id: id
            },
            select: {
                id: true, name: true
            }
        });
        logger.info("Updated tag with id: " + id);
        return updatedTag;
    }

    static remove = async (id: string) => {
        const deletedTag = await prisma.tag.delete({
            where: {
                id: id
            }, 
            select: {
                id: true, name: true
            }
        });
        
        logger.info("Tag deleted with id: " + id);
        return deletedTag;
    }  

    static getAllTags = async () => {
        const tags = await prisma.tag.findMany({
            select: {
                id: true, name: true
            }
        });
        return tags;
    }

    static getTagById = async (id: string) => {
        const tag = await prisma.tag.findFirst({
            where: {
                id: id
            },
            select: {
                id: true, name: true
            }
        });
        return tag;
    }
}

