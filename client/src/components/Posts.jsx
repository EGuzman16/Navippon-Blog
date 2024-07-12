import React, { useContext, useEffect, useState } from 'react'
import PostItem from './PostItem'
import axios from 'axios'
import Loader from './Loader';
import Thumbnail1 from '../images/blog1.jpg'
import Thumbnail2 from '../images/blog2.jpg'
import Thumbnail3 from '../images/blog3.jpg'
import Thumbnail4 from '../images/blog4.jpg'


const DUMMY_POSTS = [
  {
    id: '1',
    thumbnail: Thumbnail1,
    category: 'gastronomia',
    title: 'Título del primer blog',
    desc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat dolor dolorum est ratione alias inventore sed, blanditiis suscipit facilis quis quas, molestiae totam quibusdam Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    authorID: 3
  },
  {
    id: '2',
    thumbnail: Thumbnail2,
    category: 'cultura',
    title: 'Título del segundo blog',
    desc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat dolor dolorum est ratione alias inventore sed, blanditiis suscipit facilis quis quas, molestiae totam quibusdam Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    authorID: 1
  },
  {
    id: '3',
    thumbnail: Thumbnail3,
    category: 'gastronomia',
    title: 'Título del tercer blog',
    desc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat dolor dolorum est ratione alias inventore sed, blanditiis suscipit facilis quis quas, molestiae totam quibusdam Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    authorID: 13
  },
  {
    id: '4',
    thumbnail: Thumbnail4,
    category: 'arte',
    title: 'Título del primer blog',
    desc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat dolor dolorum est ratione alias inventore sed, blanditiis suscipit facilis quis quas, molestiae totam quibusdam Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    authorID: 11
  },
]


const Posts = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
        setPosts(response?.data)
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }

    fetchPosts();
  }, [])


  if(isLoading) {
    return <Loader/>
  }

  return (
      <section className="posts">
          {posts.length ? <div className="container posts__container">
              {
                posts.map(({_id:id, thumbnail, category, title, description, creator, createdAt}) => <PostItem key={id} postID={id} thumbnail={thumbnail} category={category} title={title} description={description} authorID={creator} createdAt={createdAt}/>)
              }
          </div> : <h2 className='center'>Post no encontrado.</h2>}
      </section>
  )
}

export default Posts