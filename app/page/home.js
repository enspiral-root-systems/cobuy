module.exports = {
  needs: {
    'html.create': 'first',
    'app.layout': 'first'
  },
  create: (api) => ({
    route: '/',
    layout: api.app.layout,
    view: (model) => api.html.create`
      <div>home!</div>  
    `
  })
}
