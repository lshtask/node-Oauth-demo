const clientID = '49f0a8cc9a6eed4ba0e2'
const clientSecret = '93dfa10d8dc52c15fb5c661d893232ff1eb86516'

const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const route = require('koa-route');
const axios = require('axios');

const app = new Koa();

const main = serve(path.join(__dirname + '/public'));

const oauth = async ctx => {
  const requestToken = ctx.request.query.code;
  console.log('authorization code:', requestToken);

  const tokenResponse = await axios({
    method: 'post',
    url: 'https://github.com/login/oauth/access_token?' +
      `client_id=${clientID}&` +
      `client_secret=${clientSecret}&` +
      `code=${requestToken}`,
    headers: {
      accept: 'application/json'
    }
  });

  const accessToken = tokenResponse.data.access_token;

  const result = await axios({
    method: 'get',
    url: `https://api.github.com/repos/lshtask/BI/issues`,
    headers: {
      accept: 'application/json',
      Authorization: `token ${accessToken}`
    }
  });
  
  const name = result.data.name;

  ctx.response.redirect(`/welcome.html?name=${result.data}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));

app.listen(8080);
