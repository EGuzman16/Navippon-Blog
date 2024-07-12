import React, {useState, useEffect, useContext} from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/Loader'
import { UserContext } from '../context/userContext'

const Dashboard = () => {
    const {id} = useParams()
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate()

    const {currentUser} = useContext(UserContext)
    const token = currentUser?.token;

    // redirigir a la página de inicio de sesión para que cualquier usuario llegue a esta página sin token
    useEffect(() => {
        if(!token) {
        navigate('/login')
        }
    }, [])

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/users/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
                setPosts(response.data)
            } catch (error) {
                console.log(error)
            }
            setIsLoading(false)
        }

        fetchPosts()
    }, [id])



    //mostrar la ruleta de carga (loading)
    if(isLoading) {
        return <Loader/>
    }


    const removePost = async (postId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/posts/${postId}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
            navigate(0)
        } catch (error) {
            console.log(error)
        }
    }



    return (
        <section className="dashboard">
            {posts.length ? <div className="container dashboard__container">
                {posts.map(post => {
                    return <article key={post._id} className="dashboard__post">
                        <div className='dashboard__post-info'>
                            <div className="dashboard__post-thumbnail">
                                <img src={`${process.env.REACT_APP_ASSET_URL}/uploads/${post.thumbnail}`} alt="" />
                            </div>
                            <h5>{post.title}</h5>
                        </div>
                        <div className="dashboard__post-actions">
                            <Link to={`/posts/${post._id}`} className='btn sm'>Ver</Link>
                            <Link to={`/posts/${post._id}/edit`} className='btn primary sm'>Editar</Link>
                            <Link onClick={() => removePost(post._id)} className='btn danger sm'>Borrar</Link>
                        </div>
                    </article>
                })
                }
            </div> : <h2 className='center'>Aún no tienes publicaciones.</h2>}
        </section>
    )
}

export default Dashboard