import React from 'react';
import {Composition, Folder} from 'remotion';
import './shared/fonts';
import {Ad01} from './ad01/Ad01';
import edl01 from './ad01/edl.json';
import {Ad02} from './ad02/Ad02';
import edl02 from './ad02/edl.json';
import {Ad03} from './ad03/Ad03';
import edl03 from './ad03/edl.json';
import {Ad04} from './ad04/Ad04';
import edl04 from './ad04/edl.json';
import {Reel01} from './reel01/Reel01';
import edlR1 from './reel01/edl.json';
import {Reel02} from './reel02/Reel02';
import edlR2 from './reel02/edl.json';
import {Reel03, Reel03Cover} from './reel03/Reel03';
import edlR3 from './reel03/edl.json';
import {Still} from 'remotion';

export const RemotionRoot: React.FC = () => (
  <Folder name="Custom-Patch-Lab-Campaign">
    <Composition id="CustomPatchLabAd01" component={Ad01} durationInFrames={edl01.durationInFrames} fps={edl01.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabAd02" component={Ad02} durationInFrames={edl02.durationInFrames} fps={edl02.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabAd03" component={Ad03} durationInFrames={edl03.durationInFrames} fps={edl03.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabAd04" component={Ad04} durationInFrames={edl04.durationInFrames} fps={edl04.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabReel01" component={Reel01} defaultProps={{captions: true}} durationInFrames={edlR1.durationInFrames} fps={edlR1.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabReel01NoCaptions" component={Reel01} defaultProps={{captions: false}} durationInFrames={edlR1.durationInFrames} fps={edlR1.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabReel02" component={Reel02} durationInFrames={edlR2.durationInFrames} fps={edlR2.fps} width={1080} height={1920} />
    <Composition id="CustomPatchLabReel03" component={Reel03} durationInFrames={edlR3.durationInFrames} fps={edlR3.fps} width={1080} height={1920} />
    <Still id="CustomPatchLabReel03Cover" component={Reel03Cover} width={1080} height={1920} />
  </Folder>
);
