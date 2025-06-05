import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const FeatureHighlightSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[404px] h-[253px] bg-[#0c0c0c] rounded-[15px] overflow-hidden border-[0.3px] border-solid border-[#ffffffb2]">
      <CardContent className="p-0 relative h-full">
        <div className="p-[22px] flex flex-col justify-between h-full">
          <p className="font-medium text-white text-sm font-['Inter',Helvetica]">
            I&apos;m waiting for this, looking forward with this wonderfull
          </p>

          <div className="flex items-center gap-3">
            <Avatar className="w-[55px] h-[55px] rounded-[27.5px] bg-[#d9d9d9]">
              <AvatarFallback className="bg-[#d9d9d9]"></AvatarFallback>
            </Avatar>
            <span className="font-['Inter',Helvetica] font-medium text-white text-xl">
              Rich Mond KO
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
