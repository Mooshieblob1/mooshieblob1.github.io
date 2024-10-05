<template>
  <footer class="footer-container">
    <div class="footer-text">
      <span>© 2024 Mooshieblob</span>
      <a
        id="ipv6"
        href="https://iplocation.io/ipv6-compatibility-checker?url=referer"
      >
        <img
          src="https://iplocation.io/images/ipv6-non-validated.svg"
          alt="ipv6 ready"
          title="ipv6 ready"
          style="border: 0; padding: 0"
          width="36"
          height="18"
        />
      </a>
    </div>
  </footer>
</template>

<script>
import "~/assets/css/output.css";

export default {
  name: "WebFooter",
};
</script>

<style scoped>
.footer-container {
  background-color: transparent;
  backdrop-filter: blur(10px);
  text-align: center;
  padding: 20px;
  text-shadow: 0 0 8px black;
  position: relative !important;
}
</style>
