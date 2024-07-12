import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiEdit } from 'react-icons/fi'
import { BiCheck } from 'react-icons/bi'
import { UserContext } from '../context/userContext'

const UserProfile = () => {
    const [avatarTouched, setAvatarTouched] = useState(false)
    const [avatar, setAvatar] = useState('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [error, setError] = useState('')

    const navigate = useNavigate();

    const { currentUser } = useContext(UserContext)
    const token = currentUser?.token;

    // redirigir a la página de inicio de sesión para que cualquier usuario llegue a esta página sin token
    useEffect(() => {
        if (!token) {
            navigate('/login')
        }
    }, [])

    const { id } = useParams()




    useEffect(() => {
        // Obteniendo detalles del usuario actual de la base de datos
        const getUser = async () => {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${id}`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } })
            const { name, email, avatar } = response.data
            setName(name)
            setEmail(email)
            setAvatar(avatar)
        }
        getUser()
    }, [])


    // Function cambiar el avatar del usuario 
    const changeAvatarHandler = async () => {
        setAvatarTouched(false);
        try {
            const postData = new FormData()
            postData.set('avatar', avatar);
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/change-avatar`, postData, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } })
            setAvatar(response?.data.avatar)
        } catch (error) {
            setError(error.response.data.message)
            console.log(error)
        }
    }


    // Function para actualizar los datos del usuario
    const updateUserDetail = async (e) => {
        try {
            e.preventDefault()
            const userData = new FormData()
            userData.set('name', name)
            userData.set('email', email)
            userData.set('currentPassword', currentPassword)
            userData.set('newPassword', newPassword)
            userData.set('confirmNewPassword', confirmNewPassword)

            const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/users/edit-user`, userData, {
                withCredentials: true, headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.status === 200) {

                navigate('/logout')
            }
        } catch (error) {
            setError(error.response.data.message)
        }
    }



    return (
        <section className="profile">
            <div className="container profile__container">
                <Link to={`/myposts/${currentUser?.id}`} className='btn'>Mis Posts</Link>

                <div className="profile__details">
                    <div className="avatar__wrapper">
                        <div className="profile__avatar">
                            <img src={`${process.env.REACT_APP_ASSET_URL}/uploads/${avatar}`} alt="" />
                        </div>
                        {/* Formulario para actualizar avatar */}
                        <form className='avatar__form'>
                            <input type="file" id='avatar' name='avatar' onChange={e => setAvatar(e.target.files[0])} accept="png, jpg, jpeg" />
                            <label htmlFor="avatar" value={avatarTouched} onClick={() => setAvatarTouched(!avatarTouched)}><FiEdit /></label>
                        </form>
                        {avatarTouched && <button type="submit" className='profile__avatar-btn' onClick={changeAvatarHandler}><BiCheck /></button>}
                    </div>

                    <h1>{name}</h1>

                    {/* Formulario para actualizar datos de usuario */}
                    <form className='form profile__form' onSubmit={updateUserDetail}>
                        {error && <p className='form__error-message'>{error}</p>}
                        <input type="text" placeholder='Nombre Completo' value={name} onChange={e => setName(e.target.value)} />
                        <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
                        <input type="password" placeholder='Contraseña Actual' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        <input type="password" placeholder='Nueva contraseña' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <input type="password" placeholder='Confirma nueva contraseña' value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                        <button type="submit" className='btn primary'>Actualizar mis datos</button>
                    </form>
                </div>

            </div>
        </section>
    )
}

export default UserProfile