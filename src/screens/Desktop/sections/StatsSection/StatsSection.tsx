import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const StatsSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[404px] bg-[#0c0c0c] rounded-[15px] overflow-hidden border-[0.3px] border-solid border-[#ffffffb2]">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <div className="font-medium text-white text-sm font-sans">
          I&apos;m waiting for this, looking forward with this wonderfull
        </div>

        <div className="flex items-center mt-16 gap-4">
          <Avatar className="h-[55px] w-[55px] bg-[#d9d9d9] rounded-[27.5px]">
            <AvatarFallback>RM</AvatarFallback>
          </Avatar>
          <div className="font-medium text-white text-xl font-sans">
            Rich Mond KO
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
