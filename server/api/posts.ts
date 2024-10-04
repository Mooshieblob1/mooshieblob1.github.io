import { defineEventHandler, getQuery, createError } from 'h3'

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
}

interface PaginatedResponse {
  posts: Post[];
  hasMore: boolean;
}

const posts = [
  {
    id: 1,
    title: "Getting Started with Nuxt 3",
    excerpt: "Learn the basics of Nuxt 3 and how to create your first project.",
    content: "Nuxt 3 is a powerful framework for building server-side rendered Vue.js applications. In this post, we'll cover the basics of setting up a Nuxt 3 project and explore its key features. We'll start by installing the Nuxt 3 CLI, creating a new project, and understanding the folder structure. Then, we'll dive into Nuxt 3's auto-imports, file-based routing, and server-side rendering capabilities. By the end of this tutorial, you'll have a solid foundation to start building your own Nuxt 3 applications."
  },
  {
    id: 2,
    title: "Mastering Tailwind CSS",
    excerpt: "Dive deep into Tailwind CSS and learn how to create stunning designs efficiently.",
    content: "Tailwind CSS is a utility-first CSS framework that allows you to rapidly build custom user interfaces. In this comprehensive guide, we'll explore advanced Tailwind concepts and techniques. We'll cover topics such as customizing your Tailwind configuration, creating reusable components, and optimizing your builds for production. You'll also learn about responsive design, dark mode, and how to extend Tailwind with your own custom utilities. By mastering these concepts, you'll be able to create beautiful, responsive designs with remarkable efficiency."
  },
  {
    id: 3,
    title: "Vue 3 Composition API: A Deep Dive",
    excerpt: "Explore the power of Vue 3's Composition API and how it can improve your code organization.",
    content: "The Composition API is a game-changer in Vue 3, offering a more flexible and powerful way to organize component logic. In this in-depth tutorial, we'll cover everything from basic setup to advanced patterns. You'll learn how to use reactive references, computed properties, and lifecycle hooks within the Composition API. We'll also explore how to create and use custom composables to share logic across components. By the end of this post, you'll have a solid understanding of how the Composition API can help you write more maintainable and scalable Vue applications."
  },
  {
    id: 4,
    title: "Advanced State Management in Vue",
    excerpt: "Explore different state management techniques in Vue applications.",
    content: "State management is crucial in large-scale Vue applications. In this post, we'll dive into advanced state management techniques, comparing Vuex, Pinia, and custom solutions. We'll start by reviewing the concepts of state, getters, mutations, and actions in Vuex. Then, we'll explore how Pinia simplifies state management with its intuitive API. We'll also look at when and how to implement custom state management solutions using Vue's reactivity system. By the end of this article, you'll have a comprehensive understanding of state management in Vue and be able to choose the best solution for your projects."
  },
  {
    id: 5,
    title: "Building Responsive Layouts with CSS Grid",
    excerpt: "Learn how to create complex, responsive layouts using CSS Grid.",
    content: "CSS Grid has revolutionized web layout design. This comprehensive guide will take you through the basics of CSS Grid and show you how to create complex, responsive layouts with ease. We'll start with the fundamentals of grid containers and grid items, then move on to more advanced topics like named grid lines, template areas, and the FR unit. You'll learn how to create responsive layouts that adapt to different screen sizes without relying on media queries. By the end of this tutorial, you'll have the skills to create sophisticated, flexible layouts that work across all devices."
  },
  {
    id: 6,
    title: "TypeScript Best Practices in Vue",
    excerpt: "Improve your Vue projects with TypeScript and learn best practices for type-safe development.",
    content: "TypeScript has become increasingly popular in the Vue ecosystem, offering improved developer experience and code reliability. In this post, we'll explore TypeScript best practices specifically for Vue projects. We'll cover topics such as properly typing component props, emits, and refs. You'll learn how to leverage TypeScript's type inference in Vue's Composition API and how to create type-safe Vuex stores. We'll also discuss strategies for gradually adopting TypeScript in existing Vue projects. By following these best practices, you'll be able to write more robust and maintainable Vue applications."
  },
  {
    id: 7,
    title: "Optimizing Performance in Nuxt Applications",
    excerpt: "Learn techniques to improve the performance of your Nuxt applications.",
    content: "Performance is crucial for providing a great user experience. In this article, we'll explore various techniques to optimize the performance of your Nuxt applications. We'll cover topics such as code splitting, lazy loading components, and optimizing asset delivery. You'll learn how to leverage Nuxt's built-in performance features and how to use tools like Lighthouse to measure and improve your app's performance. We'll also discuss server-side rendering strategies and how to optimize your API calls. By applying these techniques, you'll be able to create lightning-fast Nuxt applications that provide an excellent user experience."
  },
  {
    id: 8,
    title: "Creating Custom Directives in Vue 3",
    excerpt: "Extend Vue's template syntax with powerful custom directives.",
    content: "Custom directives in Vue 3 allow you to extend the template syntax with your own behavior. In this tutorial, we'll dive deep into creating and using custom directives. We'll start with the basics of directive definition and hook functions. Then, we'll explore practical examples such as creating a 'v-focus' directive for auto-focusing inputs, a 'v-click-outside' directive for detecting clicks outside an element, and a 'v-lazy-load' directive for images. You'll learn how to pass arguments and modifiers to your directives and how to make them reactive. By the end of this post, you'll be able to create powerful, reusable directives to enhance your Vue applications."
  },
  {
    id: 9,
    title: "Mastering CSS Animations and Transitions",
    excerpt: "Create stunning visual effects with CSS animations and transitions.",
    content: "CSS animations and transitions can bring your web pages to life, creating engaging and interactive user experiences. In this comprehensive guide, we'll explore the world of CSS animations and transitions. We'll start with the basics of transitions, learning how to smoothly animate property changes. Then, we'll dive into keyframe animations, creating more complex and controlled animations. You'll learn about timing functions, animation fill modes, and how to trigger animations with JavaScript. We'll also cover performance considerations and how to create accessible animations. By the end of this tutorial, you'll have the skills to create beautiful, performant animations that enhance your web designs."
  },
  {
    id: 10,
    title: "Building a RESTful API with Node.js and Express",
    excerpt: "Learn how to create a robust RESTful API using Node.js and Express.",
    content: "Building a RESTful API is a crucial skill for full-stack developers. In this tutorial, we'll walk through the process of creating a RESTful API using Node.js and Express. We'll start by setting up a basic Express server and defining our API endpoints. You'll learn how to handle different HTTP methods, validate input data, and structure your API for scalability. We'll also cover topics such as middleware usage, error handling, and API documentation with Swagger. Additionally, we'll discuss best practices for API security, including authentication and rate limiting. By the end of this guide, you'll have the knowledge to build robust, scalable APIs that can serve as the backbone for your web applications."
  }
]

export default defineEventHandler((event): Post | PaginatedResponse => {
  const { id } = event.context.params || {};

  if (id) {
    const post = posts.find(p => p.id === parseInt(id));
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found',
      })
    }
    return post;
  }

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 3
  
  if (page < 1 || limit < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid page or limit parameter',
    })
  }

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const paginatedPosts = posts.slice(startIndex, endIndex)
  
  return {
    posts: paginatedPosts,
    hasMore: endIndex < posts.length
  }
})