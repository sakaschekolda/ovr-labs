const { addAliases } = require('module-alias');

addAliases({
  '@': __dirname,
  '@models': __dirname + '/models',
  '@controllers': __dirname + '/controllers',
  '@routes': __dirname + '/routes',
  '@middleware': __dirname + '/middleware',
  '@config': __dirname + '/config',
  '@utils': __dirname + '/utils'
}); 