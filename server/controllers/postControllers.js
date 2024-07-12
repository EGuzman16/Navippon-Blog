const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require("uuid")
const HttpError = require('../models/errorModel')
const { mongoose } = require('mongoose')



//============================== CREAR NUEVA PUBLICACIÓN
// POST : api/posts/

const createPost = async (req, res, next) => {
    try {
        let {title, category, description} = req.body;
        if(!title || !category || !description || !req.files) {
            return next(new HttpError("Complete todos los campos y elija la miniatura.", 422))
        }
        
        const {thumbnail} = req.files;
        // check tamaño img
        if(thumbnail.size > 2000000) {
            return next(new HttpError("Miniatura demasiado grande. El tamaño del archivo debe ser inferior a 2 MB."))
        }
        
        let fileName;
        fileName = thumbnail.name;
        let splittedFilename = fileName.split('.')
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if(err) {
                return next(new HttpError(err))
            } else {
                const newPost = await Post.create({title, category, description, thumbnail: newFilename, creator: req.user.id});
                if(!newPost) {
                    return next(new HttpError("Algo salió mal.", 422))
                }
                // Encuentra usuario y aumenta el recuento de publicaciones en 1
                const currentUser = await User.findById(req.user.id)
                const userPostCount = currentUser?.posts + 1;
                await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

                res.status(201).json(newPost)
            }
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}


//============================== OBTENER TODAS LAS PUBLICACIONES
// GET : api/posts/

const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1});
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error))
    }
}


//============================== OBTENER PUBLICACIONES INDIVIDUALES
// GET : api/posts/:id

const getPost = async (req, res, next) => {
    try {
        const postID = req.params.id;
        const post = await Post.findById(postID);
        if(!post) {
            return next(new HttpError("Post no encontrado.", 404))
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error));
    }
}


//============================== POSTS POR CATEGORIA
// GET : api/posts/categories/:category

const getCatPosts = async (req, res, next) => {
    try {
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1})
        res.json(catPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//============================== POSTS POR AUTOR
// GET : api/posts/users/:id

const getUserPosts = async (req, res, next) => {
    const {id} = req.params;
    try {
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//============================== EDITAR POST
// PATCH : api/posts/:id

const editPost = async (req, res, next) => {
    let fileName;
    let newFilename;
    let updatedPost
    try {
        const postID = req.params.id;
        let { title, category, description } = req.body;
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill all fields", 422))
        }
        
        // TRAER VIEJO POST DE LA BD 
        const oldPost = await Post.findById(postID);

        if(req.user.id == oldPost.creator) {
            // actualizar publicación sin miniatura
            if(!req.files) {
                updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description}, {new: true})
            } else {
                // eliminar miniatura antigua de las cargas
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                }})
                
                // subir nueva miniatura
                const {thumbnail} = req.files;
                // comprobar el tamaño del archivo
                if(thumbnail.size > 2000000) {
                    return next(new HttpError("Miniatura demasiado grande. Debe ser menos de 2mb"))
                }
                fileName = thumbnail.name;
                let splittedFilename = fileName.split('.')
                newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                    if(err) {
                        return next(new HttpError(err))
                    }
                })
        
                updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description, thumbnail: newFilename}, {new: true})
            }
        } else {
            return next(new HttpError("No se pudo actualizar la publicación.", 403))
        }

        if(!updatedPost) {
            return next(new HttpError("No se pudo actualizar la publicación", 400))
        }
        res.json(updatedPost)

    } catch (error) {
        return next(new HttpError(error))
    }
}



//============================== BORRAR POST
// DELETE : api/posts/:id

const removePost = async (req, res, next) => {
    const postID = req.params.id;
    if(!postID) {
        return next(new HttpError("Publicación no disponible"))
    }
    const post = await Post.findById(postID);
    const fileName = post?.thumbnail;
    if(req.user.id == post.creator) {
        // eliminar miniatura de las cargas
    fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
        if (err) {
            return next(err)
        } else {
            await Post.findByIdAndDelete(postID)
           // Encuentra usuario y reduce el recuento de publicaciones en 1
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
            res.json("Post Borrado")
        }
        })
    } else {
        return next(new HttpError("No se pudo eliminar la publicación.", 403))
    }
}

module.exports = {getPosts, getPost, getCatPosts, getUserPosts, createPost, editPost, removePost}