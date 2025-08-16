import { Response } from "express";
import { TTag } from "../types/tag.type";
import { TagRepository } from "../repositories/tag.repository";
import { ApiError } from "../../utils/ApiError";

export class TagService {
    static createTag = async (data: TTag, res: Response) => {
        {
            const tag = await TagRepository.getTagByName(data.name);
            if (tag) {
                throw new ApiError("Tag name already exists", 500);
            }
        }

        const createdTag = await TagRepository.create(data);  
        
        if (!createdTag) {
            throw new ApiError("Failed to create new tag", 500);
        }
        res.locals.success = true;
        res.locals.message = "Successfully created new tag";
        res.locals.data = createdTag;
        res.locals.statusCode = 201;
    }
    
    static updateTag = async (id: string, data: TTag, res: Response) => {
        if (!id) {
            throw new ApiError("No ID provided to update the tag.")
        }
        const updatedTag = await TagRepository.update(id, data);
        if (!updatedTag) {
            throw new ApiError("Failed to update tag", 500);
        }
        res.locals.success = true;
        res.locals.message = "Successfully updated new tag";
        res.locals.data = updatedTag;
        res.locals.statusCode = 201;
    }
    
    static removeTag = async (id: string, res: Response) => {
        {
            if (!id) {
                throw new ApiError("No ID provided to remove the tag.")
            }
            const tag = await TagRepository.getTagById(id);
            if (!tag) {
                throw new ApiError("Tag with given id doesn't exist", 500);
            }
        }
        const deletedTag = await TagRepository.remove(id);
        if (!deletedTag) {
            throw new ApiError("Failed to delete tag", 500);
        }
        res.locals.success = true;
        res.locals.message = "Successfully deleted tag";
        res.locals.data = deletedTag;
        res.locals.statusCode = 201;

    }

    static getAllTag = async (res: Response) => {
        const tags = await TagRepository.getAllTags();
        
        if (!tags) {
            throw new ApiError("Failed to get all tags", 500);
        }

        res.locals.success = true;
        res.locals.message = "Successfully retrieved all tags.";
        res.locals.data = tags;
    }
    
    static getTagById = async (id: string, res: Response) => {
        const tag = await TagRepository.getTagById(id);
        
        if (tag) {
            res.locals.message = "Tag found with give id.";
        } else {
            res.locals.message = "No tag exists with given id.";
        }

        res.locals.success = true;
        res.locals.data = tag;
    }

}