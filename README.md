<div align="center">
  <br><br>
  <img src="https://cdn.rawgit.com/yuhr/obake/master/res/ghost.svg" width="140px">
  <br><br>
  <p>A general purpose command-line wrapper</p>
  <h1>obake</h1>
  <a href="https://www.npmjs.com/package/@yuhr/obake">
    <img src="https://img.shields.io/npm/v/@yuhr/obake.svg">
  </a>
  <br><br><br><br>
</div>

> [**Obake**](https://en.wikipedia.org/wiki/Obake) (お化け) and **bakemono** (化け物) are a class of [yōkai](https://en.wikipedia.org/wiki/Yōkai), [preternatural](https://en.wikipedia.org/wiki/Preternatural) creatures in [Japanese folklore](https://en.wikipedia.org/wiki/Japanese_folklore). Literally, the terms mean *a thing that changes*, referring to a state of transformation or [shapeshifting](https://en.wikipedia.org/wiki/Shapeshifting).

Obake is a thin command-line wrapper for fun. The name derives from the Japanese word お<ruby>化<rp>（</rp><rt>ば</rt><rp>）</rp></ruby>け ([IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet): /o̞bäke̞/ ). Planned to introduce more useful features e.g. template **bake**ry in the near future.

*Keep it succinct!* Obake brings on [`@std/esm`](https://github.com/standard-things/esm) for your config files so you'll find the nature of modules well-ordered—but at the same time you'll see obake—just alike Ariel in *The Tempest*, cruel obake indiscriminately scrumbles all the material needed to be supercharged into the global environment, with prefix `$`.

Where you put a directory named `.obake` containing a file `index.mjs` with following content:

```javascript
export default {
  [$default]: 'hello',
  hello: {
    [$default]: $shell`echo Hello, World!`,
    [$description]: 'Print hello world'
  }
};
```

You can run it easily on the terminal:

```
$ obake

  👻  you've encountered helloing obake!

Hello, World!
```

## Install

```
npm install --global @yuhr/obake
```

```
yarn global add @yuhr/obake
```

Still under heavy development. Please follow up the status.

## Motivation

- `docker-compose up -d --scale nginx=2 nginx haproxy`

TOO LONG