const newSessionRoutes = [
  {
    path: '/user/login',
    method: 'POST'
  }
];

const authRoutes = [
  {
    path: 'user/change-password',
    method: 'PUT'
  }
];

module.exports = {
  newSessionRoutes,
  authRoutes
};
