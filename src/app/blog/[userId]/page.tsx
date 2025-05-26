'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, UserProfile } from '@/services/userService'
import { getPostsByUser, Blog } from '@/services/blogService'
import { getCategoryTree, CategoryNode } from '@/services/categoryService'
import { CategorySelector } from '@/components/Category/CategorySelector'

import { UserProfileHeader } from '@/components/Blog/UserProfileHeader'
import { BlogControls }     from '@/components/Blog/BlogControls'
import { CategoryFilterButton }      from '@/components/Category/CategoryFilterButton'
import { PostsGrid }         from '@/components/Blog/PostsGrid'
import { DeleteModal }       from '@/components/Blog/DeleteModal'

export default function BlogPage() {
  const { userId: authUserId, isAuthenticated } = useAuth()
  const { userId: paramUserId } = useParams<{ userId: string }>()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [errorUser, setErrorUser] = useState<string | null>(null)

  const [postsAll, setPostsAll] = useState<Blog[]>([])
  const [posts, setPosts]       = useState<Blog[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [errorPosts, setErrorPosts]     = useState<string | null>(null)

  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [errorCats, setErrorCats]     = useState<string | null>(null)

  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null)

  const isMyBlog = paramUserId === authUserId

  useEffect(() => {
    if (!paramUserId) return
    setLoadingUser(true)
    getUserProfile(paramUserId)
      .then(p => setProfile(p))
      .catch(err => setErrorUser(err.message))
      .finally(() => setLoadingUser(false))
  }, [paramUserId])

  useEffect(() => {
    if (!paramUserId) return
    setLoadingPosts(true)
    getPostsByUser(paramUserId)
      .then(data => {
        setPostsAll(data)
        setPosts(data)
        setErrorPosts(null)
      })
      .catch(err => setErrorPosts(err.message))
      .finally(() => setLoadingPosts(false))
  }, [paramUserId])

  useEffect(() => {
    if (!paramUserId) return
    setLoadingCats(true)
    getCategoryTree(paramUserId)
      .then(data => {
        setCategories(data)
        setErrorCats(null)
      })
      .catch(err => setErrorCats(err.message))
      .finally(() => setLoadingCats(false))
  }, [paramUserId])

  useEffect(() => {
    setPosts(
      selectedCategory == null
        ? postsAll
        : postsAll.filter(() => false)
    )
  }, [selectedCategory, postsAll])

  const handleDelete = (id: number) => {
    setDeleteTarget(postsAll.find(p => p.id === id) ?? null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setPosts(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {loadingUser
        ? <p>프로필 로딩 중…</p>
        : errorUser
        ? <p className="text-red-500">{errorUser}</p>
        : profile && (
          <UserProfileHeader
            profile={profile}
            isMyBlog={isMyBlog}
          />
        )
      }

      {isMyBlog && <BlogControls />}

      <CategoryFilterButton
        selectedCategory={selectedCategory}
        onOpen={() => setIsCatModalOpen(true)}
      />

      {loadingPosts
        ? <p className="text-center">로딩 중…</p>
        : errorPosts
        ? <p className="text-center text-red-500">{errorPosts}</p>
        : <PostsGrid
            posts={posts}
            isMyBlog={isMyBlog}
            onDelete={handleDelete}
          />
      }

      <DeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <CategorySelector
        userId={paramUserId}
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  )
}