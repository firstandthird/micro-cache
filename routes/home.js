exports.home = {
  path: '/',
  method: 'get',
  handler(request, reply) {
    reply.view('test', {});
    // reply('micro-media');
  }
};
