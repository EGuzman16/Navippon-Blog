import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

const Register = () => {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        password2: "",
    })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const changeInputHandler = (e) => {
        setUserData(prevState => {
            return {...prevState, [e.target.name]: e.target.value}
        })
    }

    const registerUser = async (e) => {
        e.preventDefault();
        setError('')
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/register`, userData)
            const newUser = await response.data;
            if(!newUser) {
                setError("No se pudo registrar el usuario. Por favor intente nuevamente.")
            }
            navigate('/login')
        } catch (err) {
            setError(err.response.data.message);
        }
    }


    return (
        <section className="register">
            <div className="container">
                <h2>Registro</h2>
                <form onSubmit={registerUser} className='form register__form'>
                    {error && <p className='form__error-message'>{error}</p>}
                    <input type="text" placeholder='Nombre Completo' name="name" value={userData.name} onChange={changeInputHandler} autoFocus/>
                    <input type="email" placeholder='Email' name="email" value={userData.email} onChange={changeInputHandler} />
                    <input type="password" placeholder='Contraseña' name="password" value={userData.password} onChange={changeInputHandler} />
                    <input type="password" placeholder='Confirma contraseña' name="password2" value={userData.password2} onChange={changeInputHandler} />
                    <button type="submit" className='btn primary'>Registro</button>
                </form>
                <small>Todavía no tienes cuenta? <Link to="/login">Ingresar</Link></small>
            </div>
        </section>
    )
}

export default Register