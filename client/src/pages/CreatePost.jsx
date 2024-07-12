import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UserContext } from '../context/userContext';

const CreatePost = () => {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('SinCategorizar')
    const [description, setDescription] = useState('')
    const [thumbnail, setThumbnail] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    
    const {currentUser} = useContext(UserContext)
    const token = currentUser?.token;

    // redirigir a la página de inicio de sesión para que cualquier usuario llegue a esta página sin token
    useEffect(() => {
        if(!token) {
        navigate('/login')
        }
    }, [])

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
        ],
    }

    const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
    ]
    
// ver de definir un objeto de mapeo para las categorías para ponerlo en español

    const POST_CATEGORIES = ["Cultura", "Viajes", "Tecnologia", "Entretenimiento", "Arte", "Eventos", "SinCategorizar", "Gastronomia"]


    const createPost = async (e) => {
        e.preventDefault();

        const postData = new FormData();
        postData.set('title', title);
        postData.set('category', category);
        postData.set('description', description);
        postData.set('thumbnail', thumbnail)

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/posts`, postData, {
                withCredentials: true, headers: {Authorization: `Bearer ${token}`}
            })
            if(response.status == 201) {
                return navigate('/')
            }
        } catch (err) {
            if(err.response.data.message === "TypeError: Cannot read properties of null (reading 'thumbnail')") {
                setError("Por favor escoja thumbnail")
            } else {
                setError(err.response.data.message);
            }
        }
    }

    // const changeCat = (newCat) => {
    //     setCategory(newCat)
    // }
    

    return (
        <section className="create-post">
            <div className="container">
                <h2>Crear Post</h2>
                {error && <p className="form__error-message">{error}</p>}
                <form onSubmit={createPost} className='form create-post__form' encType="multipart/form-data">
                    <input type="text" placeholder='Título' value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                    <select name='category' value={category} onChange={e => setCategory(e.target.value)}>
                        {
                            POST_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)
                        }
                    </select>
                    <ReactQuill modules={modules} formats={formats} value={description} onChange={setDescription}></ReactQuill>
                    <input type="file" onChange={e => setThumbnail(e.target.files[0])} accept="png, jpg, jpeg" />
                    <button type="submit" className='btn primary'>Crear</button>
                </form>
            </div>
        </section>
    )
}

export default CreatePost