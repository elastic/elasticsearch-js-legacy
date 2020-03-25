module.exports = {
  get '_default'() { return require('./7_6'); },
  get '7.6'() { return require('./7_6'); },
  get '6.8'() { return require('./6_8'); },
  get '5.6'() { return require('./5_6'); },
  get '7.7'() { return require('./7_7'); },
  get '7.x'() { return require('./7_x'); },
  get 'master'() { return require('./master'); },
};
