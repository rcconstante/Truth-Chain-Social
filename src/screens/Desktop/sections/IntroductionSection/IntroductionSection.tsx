import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const IntroductionSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[458px] h-auto bg-black rounded-[15px] overflow-hidden border border-white">
      <CardContent className="p-6">
        <div className="mb-16">
          <h2 className="text-2xl font-medium text-white font-['Inter',Helvetica] mb-3">
            Community Verify
          </h2>
          <p className="text-[13px] font-normal text-white font-['Inter',Helvetica]">
            The TruthChain community evaluates content against verifiable
            sources. Consensus determines accuracy through decentralized
            verification.
          </p>
        </div>

        <div className="relative h-[277px]">
          <div className="absolute top-0 left-0 w-[222px] h-[266px] rounded-[20px] overflow-hidden border border-solid border-white">
            <img
              className="w-full h-[263px] mt-[3px] object-cover"
              alt="Verification image"
              src="/image-2.png"
            />
          </div>

          <div className="absolute top-[87px] left-[194px] w-[209px] h-[190px] rounded-[20px] overflow-hidden border border-solid border-white">
            <img
              className="w-full h-[187px] mt-[3px] object-cover"
              alt="Verification image"
              src="/image-2.png"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
