export default {
  [$default]: 'hello',
  hello: {
    [$default]: $shell`echo Hello, World!`,
    [$description]: 'Print hello world'
  },
  main: {
    [$default]: ['sub2', 'sub3'],
    sub1: 'sub3',
    sub2: $shell`echo command: sub2 >&2; false`,
    sub3: $shell`echo command: sub3`
  },
};