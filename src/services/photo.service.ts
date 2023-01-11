import {AWSUploader} from "./bucket.service";
import {Request, Response} from "express";
import {Photo} from "../model/Photo";
import {S3File} from "../interfaces/S3File.interface";
import {UserLikes} from "../model/UserLikes";
import mongoose from "mongoose";
import {UserFavorites} from "../model/UserFavorites";
import moment from "moment";
import {UserComments} from "../model/UsersComments";

export class PhotoService {

    downloadPhotoFromAws(req: Request, res: Response) {
        const s3 = new AWSUploader();
        const readStream = s3.download(req.params.link, 'photo');
        readStream.then((data: any) => {
            data.pipe(res);
        }).catch(() => {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        })
    }

    async postPhoto(req: Request, res: Response) {
        const {title, description, categories} = req.body;
        const s3 = new AWSUploader();
        const photo = <S3File[]><unknown>req.files;
        const file = await s3.upload(photo[0], 'photo');
        const fileName = file.Key.split('photo/').join('');
        const categoriesArr = categories.trim().split(' ');
        try {
            const postPromise = new Promise(async (resolve) => {
                const response = await Photo.insertMany({
                    author: req.user.login,
                    author_id: req.user._id,
                    time: moment(),
                    title,
                    description,
                    categories: categoriesArr,
                    source: fileName,
                });
                resolve(response);
            })

            postPromise.then(async () => {
                const response = await Photo.aggregate([
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    {
                        $addFields: {
                            'likes': {$size: "$likes"},
                            'comments': {$size: "$comments"},
                            'byUser': [{$in: [new mongoose.Types.ObjectId(req.user._id), '$likes.user_id']}],
                            'favorite': [{$in: [new mongoose.Types.ObjectId(req.user._id), '$favorites.user_id']}],
                        }
                    },
                    {$sort: {time: -1}},
                ])
                res.status(200).send({message: 'SUCCESS', value: response});
            })
        } catch (e) {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async getPhotoList(req: Request, res: Response) {
        let query: any = req.query.categories;
        const queryArr = query.split(',').map((item: any) => item.toLowerCase());
        const id = req.user?._id;
        try {
            let response;
            if (query === '') {
                response = await Photo.aggregate([
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                        },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                        },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    { $addFields: {
                            'likes': { $size: "$likes" },
                            'comments': {$size: "$comments"},
                            'byUser': [{ $in: [new mongoose.Types.ObjectId(id), '$likes.user_id'] }],
                            'favorite': [{ $in: [new mongoose.Types.ObjectId(id), '$favorites.user_id'] }],
                        } },
                    { $sort: { time: -1 } },
                ])
            } else {
                response = await Photo.aggregate([
                    { $match: {categories: { $in: queryArr}}},
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                        },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                        },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    { $addFields: {
                            'likes': { $size: "$likes" },
                            'comments': {$size: "$comments"},
                            'byUser': [{ $in: [new mongoose.Types.ObjectId(id), '$likes.user_id'] }],
                            'favorite': [{ $in: [new mongoose.Types.ObjectId(id), '$favorites.user_id'] }],
                        } },
                    { $sort: { time: -1 } },
                ])
            }
            res.status(200).send({message: 'SUCCESS', value: response});
        } catch (err) {
            console.log(err);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    photoLike(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const {_id} = req.user;

            const likePromise = new Promise((resolve) => {
                resolve(UserLikes.findOne({user_id: _id, photo_id: id}))
            })

            likePromise.then(async (response) => {
                if (response) {
                    return UserLikes.findOneAndDelete({user_id: _id, photo_id: id});
                } else {
                    return await UserLikes.insertMany([{user_id: _id, photo_id: id}], );

                }
            }).then(async () => {
                const result = await Photo.aggregate([
                    { $match: { _id: new mongoose.Types.ObjectId(id)}},
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    {
                        $addFields: {
                            'likes': {$size: "$likes"},
                            'comments': {$size: "$comments"},
                            'byUser': [{ $in: [new mongoose.Types.ObjectId(_id), '$likes.user_id'] }],
                            'favorite': [{ $in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id'] }],
                        }
                    },
                    { $sort: { time: -1 } },
                ])
                return res.status(200).send({value: result[0]});
            })
        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async setFavorite(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const {_id} = req.user;

            const favoritePromise = new Promise((resolve) => {
                resolve(UserFavorites.findOne({user_id: _id, photo_id: id}))
            })

            favoritePromise.then(async (response) => {
                if (response) {
                    return UserFavorites.findOneAndDelete({user_id: _id, photo_id: id});
                } else {
                    return await UserFavorites.insertMany([{user_id: _id, photo_id: id}], );

                }
            }).then(async () => {
                const result = await Photo.aggregate([
                    { $match: { _id: new mongoose.Types.ObjectId(id)}},
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    {
                        $addFields: {
                            'likes': {$size: "$likes"},
                            'comments': {$size: "$comments"},
                            'byUser': [{ $in: [new mongoose.Types.ObjectId(_id), '$likes.user_id'] }],
                            'favorite': [{ $in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id'] }],
                        }
                    },
                    { $sort: { time: -1 } },
                ]);
                return res.status(200).send({value: result[0]});
            })
        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async getUserLiked(req: Request, res: Response) {
        try {
            const {_id} = req.user;
            const result = await Photo.aggregate([
                {
                    $lookup: {
                        from: "user_likes",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "likes"
                    }
                },
                {
                    $lookup: {
                        from: "user_favorites",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "favorites"
                    }
                },
                {
                    $lookup: {
                        from: "user_comments",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "comments"
                    }
                },
                { $match: { "likes.user_id": new mongoose.Types.ObjectId(_id)}},
                {
                    $addFields: {
                        'likes': {$size: "$likes"},
                        'comments': {$size: "$comments"},
                        'byUser': [{ $in: [new mongoose.Types.ObjectId(_id), '$likes.user_id'] }],
                        'favorite': [{ $in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id'] }],
                    }
                },
                { $sort: { time: -1 } },
            ])
            return res.status(200).send({value: result});
        } catch (e) {
            console.log(e);
            res.status(409).end();
        }
    }

    async getUserFavorites(req: Request, res: Response) {
        try {
            const {_id} = req.user;
            const result = await Photo.aggregate([
                {
                    $lookup: {
                        from: "user_likes",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "likes"
                    }
                },
                {
                    $lookup: {
                        from: "user_favorites",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "favorites"
                    }
                },
                {
                    $lookup: {
                        from: "user_comments",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "comments"
                    }
                },
                { $match: { "favorites.user_id": new mongoose.Types.ObjectId(_id)}},
                {
                    $addFields: {
                        'likes': {$size: "$likes"},
                        'comments': {$size: "$comments"},
                        'byUser': [{ $in: [new mongoose.Types.ObjectId(_id), '$likes.user_id'] }],
                        'favorite': [{ $in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id'] }],
                    }
                },
                { $sort: { time: -1 } },
            ])
            return res.status(200).send({value: result});
        } catch (e) {
            console.log(e);
            res.status(409).end();
        }
    }

    async getUserPhoto(req: Request, res: Response) {
        try {
            const {_id} = req.user;
            const result = await Photo.aggregate([
                { $match: { author_id: new mongoose.Types.ObjectId(_id)}},
                {
                    $lookup: {
                        from: "user_likes",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "likes"
                    }
                },
                {
                    $lookup: {
                        from: "user_favorites",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "favorites"
                    }
                },
                {
                    $lookup: {
                        from: "user_comments",
                        localField: "_id",
                        foreignField: "photo_id",
                        as: "comments"
                    }
                },
                {
                    $addFields: {
                        'likes': {$size: "$likes"},
                        'comments': {$size: "$comments"},
                        'byUser': [{ $in: [new mongoose.Types.ObjectId(_id), '$likes.user_id'] }],
                        'favorite': [{ $in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id'] }],
                    }
                },
                { $sort: { time: -1 } },
            ])
            return res.status(200).send({value: result});
        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async getUsersLikesById(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const result = await UserLikes.aggregate([
                {$match: {photo_id: new mongoose.Types.ObjectId(id)}},
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {$unwind: '$users'},
                {
                    $addFields: {
                        'user': '$users.login'
                    }
                },
                {
                    $project: {
                        user: 1,
                    }
                }
            ])
            res.status(200).send({value: result});
        } catch (e) {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async deleteUserPhoto(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const {_id} = req.user;
            const result = await Photo.findOneAndDelete({author_id: _id, _id: id});
            res.status(200).send({value: result})
        } catch (e) {
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async postComment(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const {_id} = req.user;
            const data = req.body;

            const commentPromise = new Promise(async (resolve) => {
                const comment = await UserComments.insertMany([{
                    ...data,
                    comment_author_id: req.user._id,
                    comment_author_login: req.user.login,
                }])
                resolve(comment);
            })

            commentPromise.then(() => {
                return Photo.aggregate([
                    {$match: {_id: new mongoose.Types.ObjectId(id)}},
                    {
                        $lookup: {
                            from: "user_likes",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "likes"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_favorites",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "favorites"
                        }
                    },
                    {
                        $lookup: {
                            from: "user_comments",
                            localField: "_id",
                            foreignField: "photo_id",
                            as: "comments"
                        }
                    },
                    {
                        $addFields: {
                            'likes': {$size: "$likes"},
                            'comments': {$size: "$comments"},
                            'byUser': [{$in: [new mongoose.Types.ObjectId(_id), '$likes.user_id']}],
                            'favorite': [{$in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id']}],
                        }
                    },
                    {$sort: {time: -1}},
                ]);
            })
                .then((response) => {
                    res.status(200).send({message: 'SUCCESS', value: response[0]});
                })
        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }

    async getComments(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const response = await UserComments.find({photo_id: id});
            res.status(200).send({message: 'SUCCESS', value: response});
        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    };

    async deleteComment(req: Request, res: Response) {
        try {
            const {id, commentId} = req.params;
            const {_id} = req.user;

            const deletePromise = new Promise(async (resolve, reject) => {
                const result = await UserComments.findOneAndDelete({
                    $or: [{comment_author_id: _id}, {photo_author_id: _id}],
                    photo_id: id,
                    _id: commentId
                });
                if (result) {
                    resolve(result);
                } else {
                    reject();
                }
            });

            deletePromise
                .then(() => {
                    return Photo.aggregate([
                        {$match: {_id: new mongoose.Types.ObjectId(id)}},
                        {
                            $lookup: {
                                from: "user_likes",
                                localField: "_id",
                                foreignField: "photo_id",
                                as: "likes"
                            }
                        },
                        {
                            $lookup: {
                                from: "user_favorites",
                                localField: "_id",
                                foreignField: "photo_id",
                                as: "favorites"
                            }
                        },
                        {
                            $lookup: {
                                from: "user_comments",
                                localField: "_id",
                                foreignField: "photo_id",
                                as: "comments"
                            }
                        },
                        {
                            $addFields: {
                                'likes': {$size: "$likes"},
                                'comments': {$size: "$comments"},
                                'byUser': [{$in: [new mongoose.Types.ObjectId(_id), '$likes.user_id']}],
                                'favorite': [{$in: [new mongoose.Types.ObjectId(_id), '$favorites.user_id']}],
                            }
                        },
                        {$sort: {time: -1}},
                    ]);
                })
                .then((response) => {
                    res.status(200).send({message: 'SUCCESS', value: response[0]});
                })
                .catch(() => {
                return res.status(409).send({message: 'CONNECTION_ERROR'});
            })

            const response = await UserComments.findOneAndDelete({ $or: [ { comment_author_id: _id }, { photo_author_id: _id }], photo_id: id, _id: commentId })
            console.log(response);

        } catch (e) {
            console.log(e);
            return res.status(409).send({message: 'CONNECTION_ERROR'});
        }
    }
}
