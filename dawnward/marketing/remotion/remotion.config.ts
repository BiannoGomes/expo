import { Config } from "@remotion/cli/config";
// The container ships Chromium; Remotion uses it instead of downloading its own.
Config.setBrowserExecutable("/opt/pw-browsers/chromium");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
