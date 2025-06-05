import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const HeaderSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[404px] h-[253px] bg-[#0c0c0c] rounded-[15px] overflow-hidden border-[0.3px] border-solid border-[#ffffffb2]">
      <CardContent className="p-0 relative h-full">
        <div className="absolute top-[30px] left-[22px] font-medium text-white text-sm max-w-[245px]">
          I&apos;m waiting for this, looking forward with this wonderfull
        </div>

        <div className="absolute bottom-[22px] left-[22px] flex items-center gap-3">
          <Avatar className="w-[55px] h-[55px] bg-[#d9d9d9] rounded-[27.5px]">
            <AvatarFallback className="bg-[#d9d9d9]"></AvatarFallback>
          </Avatar>

          <div className="font-medium text-white text-xl">Rich Mond KO</div>
        </div>
      </CardContent>
    </Card>
  );
};
