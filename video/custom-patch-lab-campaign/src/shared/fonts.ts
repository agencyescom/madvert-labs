import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

const handle = delayRender('Loading brand fonts');
const faces = [
  new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces.ttf')}) format('truetype')`, {weight: '100 900'}),
  new FontFace('Oswald', `url(${staticFile('fonts/Oswald.ttf')}) format('truetype')`, {weight: '200 700'}),
  new FontFace('Montserrat', `url(${staticFile('fonts/Montserrat.ttf')}) format('truetype')`, {weight: '100 900'}),
];
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
