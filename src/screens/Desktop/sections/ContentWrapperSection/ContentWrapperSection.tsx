import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const ContentWrapperSection = (): JSX.Element => {
  return (
    <section className="w-full relative">
      <Card className="bg-black rounded-[15px] overflow-hidden border border-solid border-white">
        <CardContent className="p-0">
          <div className="p-5">
            <h2 className="font-medium text-white text-2xl font-inter mb-2">
              Earn Rewards
            </h2>
            <p className="font-normal text-white text-[13px] font-inter max-w-[520px]">
              Accurate posts earn rewards from the staking pool. Build your
              truth reputation over time and gain influence within the
              ecosystem.
            </p>
          </div>

          <div className="mx-[49px] mb-[119px] h-[383px] rounded-[20px] bg-[url(/image-5.png)] bg-cover bg-center border border-solid border-white" />
        </CardContent>
      </Card>
    </section>
  );
};
