import React from "react";
import { Composition } from "remotion";
import { Proof, PROOF_FRAMES } from "./Proof";
import { Flagship, FLAGSHIP_FRAMES, type FlagshipProps } from "./film/Flagship";
import { FPS, W, H } from "./theme";

const flag = (captions: boolean, stem: FlagshipProps["stem"]): FlagshipProps => ({ captions, stem });

export const Root: React.FC = () => (
  <>
    <Composition id="Proof" component={Proof} durationInFrames={PROOF_FRAMES} fps={FPS} width={W} height={H} />
    {/* the 60 s master; cutdowns are cut from these two renders (scripts/cutdowns.sh) */}
    <Composition id="Flagship" component={Flagship} durationInFrames={FLAGSHIP_FRAMES} fps={FPS} width={W} height={H} defaultProps={flag(true, "all")} />
    <Composition id="FlagshipClean" component={Flagship} durationInFrames={FLAGSHIP_FRAMES} fps={FPS} width={W} height={H} defaultProps={flag(false, "all")} />
  </>
);
