// app.config.ts
export default defineAppConfig({
    icon: {
      size: '40px', // default <Icon> size applied
      class: 'icon', // default <Icon> class applied
      mode: 'css', // default <Icon> mode applied
      aliases: {
        'nuxt': 'logos:nuxt-icon',
      }
    }
  })