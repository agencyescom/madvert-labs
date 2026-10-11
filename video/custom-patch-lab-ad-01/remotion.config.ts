import {Config} from '@remotion/cli/config';

// Use the Chromium headless shell that ships with this environment instead of
// downloading one. Remove this line (or point it elsewhere) on other machines.
if (process.env.REMOTION_BROWSER !== 'download') {
  Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
