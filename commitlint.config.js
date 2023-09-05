module.exports = {
  extends: [
    '@commitlint/config-conventional'
  ],
  rules: {
    'type-enum': [2, 'always', [ 'feat', 'fix', 'perf', 'refactor', 'build', 'style', 'docs', 'chore', 'test' ]],
    'type-case': [0]
  }
}