import React from "react";
import { Composition } from "remotion";
import { Proof, PROOF_FRAMES } from "./Proof";
import { FPS, W, H } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Proof" component={Proof} durationInFrames={PROOF_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
