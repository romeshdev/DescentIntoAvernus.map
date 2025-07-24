<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p>
      This is a full-stack application template with Express.js backend, Vue.js frontend, and JWT authentication.
    </p>
    <div class="features">
      <h3>Features included:</h3>
      <ul>
        <li>Express.js API server with JWT authentication</li>
        <li>Vue.js 3 with Vue Router and Pinia state management</li>
        <li>Protected routes and middleware</li>
        <li>Login/Register functionality</li>
        <li>Role-based access control</li>
        <li>Docker multi-stage build</li>
        <li>Docker Compose for development</li>
        <li>CORS and security middleware</li>
        <li>API proxy configuration</li>
        <li>Production-ready setup</li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
<style scoped>
.hello {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.features {
  margin-top: 2rem;
  text-align: left;
}

.features ul {
  list-style-type: disc;
  padding-left: 2rem;
}

.features li {
  margin: 0.5rem 0;
}
</style>