import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Ad01} from './Ad01';
import edl from './edl.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CustomPatchLabAd01"
    component={Ad01}
    durationInFrames={edl.durationInFrames}
    fps={edl.fps}
    width={1080}
    height={1920}
  />
);
