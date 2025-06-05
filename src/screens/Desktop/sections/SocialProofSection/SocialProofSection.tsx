import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const SocialProofSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[404px] h-[253px] bg-[#0c0c0c] rounded-[15px] overflow-hidden border-[0.3px] border-solid border-[#ffffffb2]">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="font-medium text-white text-sm tracking-[0] leading-[normal] font-['Inter',Helvetica]">
          I&apos;m waiting for this, looking forward with this wonderfull
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="w-[55px] h-[55px] bg-[#d9d9d9] rounded-[27.5px]">
            <AvatarFallback className="bg-[#d9d9d9]"></AvatarFallback>
          </Avatar>
          <div className="font-medium text-white text-xl tracking-[0] leading-[normal] font-['Inter',Helvetica]">
            Rich Mond KO
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
