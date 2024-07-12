const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require("uuid")
const fs = require('fs')
const path = require('path')

const User = require('../models/userModel');
const HttpError = require('../models/errorModel');


const registerUser = async (req, res, next) => {
    try {
        const {name, email, password, password2} = req.body;
        if(!name || !email || !password) {
            return next(new HttpError("Complete todos los campos.", 422))
        }

        const newEmail = email.toLowerCase();
        
        const emailExists = await User.findOne({email: newEmail});
        if(emailExists) {
            return next(new HttpError("Ya existe el correo electrónico", 422))
        }
        
        if((password.trim()).length < 6) {
            return next(new HttpError("La contraseña debe tener al menos 6 caracteres.", 422))
        }

        if(password != password2) {
            return next(new HttpError("Las contraseñas no coinciden.", 422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
  
        const newUser = await User.create({name, email: newEmail, password: hashedPass});
        res.status(201).json(`Usuario ${newUser.email} registrado.`);
    } catch (error) {
        return next(new HttpError("Error en el registro de usuario.", 422))
    }
}


// JWT token
const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"});
    return token;
}


const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Complete todos los campos.", 422))
        }

        const newEmail = email.toLowerCase()

        const user = await User.findOne({email: newEmail});
        if(!user) {
            return next(new HttpError("Credenciales no válidas.", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password);
        if(!comparePass) {
            return next(new HttpError("Credenciales no válidas.", 422))
        }

        const {_id: id, name} = user;
        const token = generateToken({id, name})
        
        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError("Error de inicio de sesion. Por favor verifique sus credenciales.", 422))
    }
}


// para la pag de perfil
const getUser = async (req, res, next) => {
    const {id} = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if(!user) {
            return next(new HttpError("Usuario no encontrado.", 404))
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError(error))
    }
}


const logoutUser = (req, res, next) => {
    res.cookie('token', '', {httpOnly: true, expires: new Date(0)})
    res.status(200).json('Usuario desconectado')
}


//Cambiar imagen de perfil de usuario
const changeAvatar = async (req, res, next) => {
    let fileName;

    try {
        if(!req.files.avatar) {
            return next(new HttpError("Algo salió mal", 422))
        }

        
        // encontrar usuario en la base de datos
        const user = await User.findById(req.user.id);
        if(user.avatar) {
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                }})
        }

        const {avatar} = req.files;
        // check tamaño archivo
        if(avatar.size > 500000) {
            return next(new HttpError("Imagen de perfil demasiado grande. El tamaño del archivo debe ser inferior a 500 kb."))
        }
        fileName = avatar.name;
        let splittedFilename = fileName.split('.')
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if(err) {
                return next(new HttpError(err))
            }
            const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFilename}, {new: true})
            if(!updatedAvatar) {
                return next(new HttpError("No se pudo cambiar el avatar.", 422))
            }
            res.status(200).json(updatedAvatar)
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}



// función para actualizar los detalles del usuario actual desde el perfil de usuario
const editUser = async (req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return next(new HttpError("Complete todos los campos.", 422))
        }

//obtener usuario de la base de datos
        const user = await User.findById(req.user.id)
        if(!user) {
            return next(new HttpError("Usuario no encontrado.", 403))
        }

     // asegúrate de que no exista un nuevo correo electrónico
        const emailExist = await User.findOne({email})
        if(emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Usuario no encontrado.", 422))
        }

  // compara la contraseña actual con la contraseña de la base de datos
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validateUserPassword) {
            return next(new HttpError("Contraseña actual inválida."))
        }

// comparar nuevas contraseñas
        if(newPassword !== confirmNewPassword) {
            return next(new HttpError("Las nuevas contraseñas no coinciden.", 422))
        }

        // hash nueva pass
        const newSalt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, newSalt)
        
        // actualiza la información del usuario en la base de datos
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: newHash}, {new: true})
        res.status(200).json(newInfo)
    } catch (error) {
        return next(new HttpError(error))
    }
}



const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.find().select('-password')
        res.json(authors);
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = {registerUser, loginUser, logoutUser, getUser, changeAvatar, editUser, getAuthors}