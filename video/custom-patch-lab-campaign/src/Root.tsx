import React from 'react';
import {Composition, Folder} from 'remotion';
import './shared/fonts';
import {Ad01} from './ad01/Ad01';
import edl01 from './ad01/edl.json';
import {Ad02} from './ad02/Ad02';
import edl02 from './ad02/edl.json';

export const RemotionRoot: React.FC = () => (
  <Folder name="Custom-Patch-Lab-Campaign">
    <Composition id="CustomPatchLabAd01" component={Ad01} durationInFrames={edl01.durationInFrames} fps={edl01.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabAd02" component={Ad02} durationInFrames={edl02.durationInFrames} fps={edl02.fps} width={1080} height={1920} />
  </Folder>
);
